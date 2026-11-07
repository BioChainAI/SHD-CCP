defmodule GeometricEngine.ConformanceTest.Envelope do
  @moduledoc false

  # Reads a top-level string member of a suite envelope. Only the text before the "cases"
  # member is searched, so a key inside a case object is never taken for an envelope key.
  def string(json, key) do
    [head | _] = :binary.split(json, "\"cases\"")

    case Regex.run(~r/[{,]\s*"#{Regex.escape(key)}"\s*:\s*"([^"\\]*)"/, head) do
      [_, value] -> value
      nil -> nil
    end
  end

  # Every suite in `dir`, as {file name without .json, suite, status}, sorted by file name.
  def discover(dir) do
    dir
    |> File.ls!()
    |> Enum.filter(&(String.ends_with?(&1, ".json") and &1 != "schema.json"))
    |> Enum.sort()
    |> Enum.map(fn file ->
      json = File.read!(Path.join(dir, file))
      {Path.rootname(file), string(json, "suite"), string(json, "status")}
    end)
  end
end

defmodule GeometricEngine.ConformanceTest do
  @moduledoc """
  Runs the binding against every suite in geometric-engine-spec/test_vectors/.

  The suites are discovered from the `.json` files in test_vectors/ (CONFORMANCE.md): each
  file's `suite` and `status` are read, a suite with a handler below runs against its SHDGEV01
  `.bin` mirror, a normative suite without a handler fails, a draft suite without a handler is
  reported as skipped, and a pending suite is skipped. A handler whose suite is missing fails.

  Spec location: $GE_SPEC_DIR, ./spec (submodule), or ../geometric-engine-spec.
  """
  use ExUnit.Case, async: true

  import Bitwise

  alias GeometricEngine.{Crt, Tile, Tqf}
  alias GeometricEngine.ConformanceTest.Envelope

  @vectors_dir [System.get_env("GE_SPEC_DIR"), "spec", "../geometric-engine-spec"]
               |> Enum.reject(&is_nil/1)
               |> Enum.map(&Path.join(&1, "test_vectors"))
               |> Enum.find(&File.dir?/1) ||
                 raise(
                   "geometric-engine-spec not found (set GE_SPEC_DIR or add the spec submodule at ./spec)"
                 )

  @handled ~w(einstein_tiles_forms_0_15 garner_crt_881_883_887 gram_tqf_collinearity)
  @suites Envelope.discover(@vectors_dir)

  defp load(suite, fields) do
    <<"SHDGEV01", ^fields::little-32, count::little-32, body::binary>> =
      File.read!(Path.join(@vectors_dir, suite <> ".bin"))

    records = for <<v::little-64 <- body>>, do: v
    assert length(records) == fields * count
    Enum.chunk_every(records, fields)
  end

  defp signed(v) when v >= 1 <<< 63, do: v - (1 <<< 64)
  defp signed(v), do: v

  defp run("einstein_tiles_forms_0_15") do
    for [tile, form, halo, payload] <- load("einstein_tiles_forms_0_15", 4) do
      assert Tile.unpack(tile) == %{form_id: form, south_halo: halo, payload: payload}
    end
  end

  defp run("garner_crt_881_883_887") do
    for [n, r1, r2, r3] <- load("garner_crt_881_883_887", 4) do
      assert Crt.encode(n) == {r1, r2, r3}
      assert Crt.decode({r1, r2, r3}) == n
    end
  end

  defp run("gram_tqf_collinearity") do
    for [x1, y1, x2, y2, x3, y3, lo, hi, collinear] <- load("gram_tqf_collinearity", 9) do
      [p1, p2, p3] =
        [x1, y1, x2, y2, x3, y3]
        |> Enum.map(&signed/1)
        |> Enum.chunk_every(2)
        |> Enum.map(&List.to_tuple/1)

      assert Tqf.gram_tqf(p1, p2, p3) == (hi <<< 64 ||| lo)
      assert Tqf.collinear?(p1, p2, p3) == (collinear == 1)
    end
  end

  for {name, suite, status} <- @suites do
    cond do
      suite != name or is_nil(status) ->
        test name do
          flunk("#{unquote(name)}.json: cannot read its suite and status")
        end

      status == "pending" ->
        @tag skip: "pending, no cases"
        test name, do: :ok

      suite in @handled ->
        test name, do: run(unquote(suite))

      status == "draft" ->
        @tag skip: "no handler for draft suite #{suite}"
        test name, do: :ok

      true ->
        test name do
          flunk("no handler for #{unquote(status)} suite #{unquote(suite)}")
        end
    end
  end

  test "every handler has a suite" do
    present = for {name, _suite, _status} <- @suites, do: name
    assert @handled -- present == []
  end

  test "envelope keys are read from the envelope only" do
    json =
      ~s({\n  "suite": "a_b",\n  "description": "the \\"status\\" key",\n  "status": "draft",\n  "cases": [{"status": "normative"}]\n})

    assert Envelope.string(json, "suite") == "a_b"
    assert Envelope.string(json, "status") == "draft"
    assert Envelope.string(~s({"cases": [{"suite": "x"}], "suite": "y"}), "suite") == nil
  end
end
