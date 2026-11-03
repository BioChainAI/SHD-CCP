defmodule GeometricEngine.Tile do
  @moduledoc """
  64-bit Einstein Tile (RFC 01, draft layout), decoded with a single bitstring match:

      bits 63..56  South Halo
      bits 55..40  payload (high)
      bits 39..36  Form ID
      bits 35..0   payload (low)
  """

  import Bitwise

  @payload_mask 0x00FF_FF0F_FFFF_FFFF

  @type t :: non_neg_integer()

  @spec unpack(t()) :: %{form_id: 0..15, south_halo: 0..255, payload: non_neg_integer()}
  def unpack(tile) when is_integer(tile) and tile >= 0 and tile <= 0xFFFF_FFFF_FFFF_FFFF do
    <<halo::8, high::16, form::4, low::36>> = <<tile::64>>
    %{form_id: form, south_halo: halo, payload: high <<< 40 ||| low}
  end

  @spec pack(0..15, 0..255, non_neg_integer()) :: t()
  def pack(form, halo, payload)
      when form in 0..15 and halo in 0..255 and is_integer(payload) and payload >= 0 and
             (payload &&& ~~~@payload_mask) == 0 do
    <<tile::64>> = <<halo::8, payload >>> 40::16, form::4, payload::36>>
    tile
  end

  def form_id(tile), do: unpack(tile).form_id
  def south_halo(tile), do: unpack(tile).south_halo
  def payload(tile), do: unpack(tile).payload
end
