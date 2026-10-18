defmodule GeometricEngineTest do
  use ExUnit.Case, async: true

  import Bitwise, only: [<<<: 2]

  alias GeometricEngine.{Crt, Tile, Tqf}

  test "tile round trip" do
    t = Tile.pack(5, 0xA5, 0x01_2345_6789)
    assert Tile.unpack(t) == %{form_id: 5, south_halo: 0xA5, payload: 0x01_2345_6789}
    assert_raise FunctionClauseError, fn -> Tile.pack(0, 0, 0xF <<< 36) end
  end

  test "crt round trip" do
    for n <- Enum.concat(0..200_000//7, [Crt.modulus() - 1]) do
      assert n |> Crt.encode() |> Crt.decode() == n
    end
  end

  test "tqf right triangle" do
    assert Tqf.gram_tqf({0, 0}, {3, 0}, {0, 4}) == 576
    assert Tqf.collinear?({0, 0}, {2, 2}, {-5, -5})
  end
end
