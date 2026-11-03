defmodule GeometricEngine.ConformanceTest do
  @moduledoc """
  Runs the binding against geometric-engine-spec/test_vectors/*.bin (SHDGEV01).

  Spec location: $GE_SPEC_DIR, ./spec (submodule), or ../geometric-engine-spec.
  """
  use ExUnit.Case, async: true

  import Bitwise

  alias GeometricEngine.{Crt, Tile, Tqf}

  @vectors_dir [System.get_env("GE_SPEC_DIR"), "spec", "../geometric-engine-spec"]
               |> Enum.reject(&is_nil/1)
               |> Enum.map(&Path.join(&1, "test_vectors"))
               |> Enum.find(&File.dir?/1) ||
                 raise(
                   "geometric-engine-spec not found (set GE_SPEC_DIR or add the spec submodule at ./spec)"
                 )

  defp load(suite, fields) do
    <<"SHDGEV01", ^fields::little-32, count::little-32, body::binary>> =
      File.read!(Path.join(@vectors_dir, suite <> ".bin"))

    records = for <<v::little-64 <- body>>, do: v
    assert length(records) == fields * count
    Enum.chunk_every(records, fields)
  end

  defp signed(v) when v >= 1 <<< 63, do: v - (1 <<< 64)
  defp signed(v), do: v

  test "einstein_tiles_forms_0_15" do
    for [tile, form, halo, payload] <- load("einstein_tiles_forms_0_15", 4) do
      assert Tile.unpack(tile) == %{form_id: form, south_halo: halo, payload: payload}
    end
  end

  test "garner_crt_881_883_887" do
    for [n, r1, r2, r3] <- load("garner_crt_881_883_887", 4) do
      assert Crt.encode(n) == {r1, r2, r3}
      assert Crt.decode({r1, r2, r3}) == n
    end
  end

  test "gram_tqf_collinearity" do
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
end
