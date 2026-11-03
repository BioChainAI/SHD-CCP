defmodule GeometricEngine do
  @moduledoc """
  SHD-CCP Geometric Engine — Elixir / OTP binding.

    * `GeometricEngine.Tile` — 64-bit Einstein Tile codec (RFC 01, draft layout)
    * `GeometricEngine.Crt` — Garner CRT over (881, 883, 887) (RFC 02)
    * `GeometricEngine.Tqf` — exact Gram-TQF collinearity (RFC 02)

  Planned: OTP supervision tree for the 12-engine + 13th-engine cuboctahedral
  memory (RFC 04) and a `:gen_statem` alignment handshake (RFC 06).
  """

  @spec_version "0.1.0"
  def spec_version, do: @spec_version
end
