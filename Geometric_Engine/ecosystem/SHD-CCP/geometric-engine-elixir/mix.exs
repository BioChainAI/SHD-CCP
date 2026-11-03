defmodule GeometricEngine.MixProject do
  use Mix.Project

  @version "0.1.0"
  @source_url "https://github.com/SHD-CCP/geometric-engine-elixir"

  def project do
    [
      app: :geometric_engine,
      version: @version,
      elixir: "~> 1.14",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      description:
        "SHD-CCP Geometric Engine for the BEAM: bitstring Einstein Tile codec, Garner CRT and exact Gram-TQF.",
      package: [licenses: ["MIT"], links: %{"GitHub" => @source_url}],
      source_url: @source_url
    ]
  end

  def application do
    [extra_applications: [:logger]]
  end

  # Zero runtime dependencies; the conformance suite reads the SHDGEV01 .bin
  # vectors with native bitstring matching instead of a JSON library.
  defp deps, do: []
end
