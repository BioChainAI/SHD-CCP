"""SHD-CCP Geometric Engine — canonical reference implementation.

Implemented (and covered by golden vectors in geometric-engine-spec):
    tile_codec   — 64-bit Einstein Tile field access (draft layout, RFC 01)
    crt_garner   — closed-form (881, 883, 887) Garner CRT cubic index (RFC 02)
    hurwitz      — exact integer Gram-TQF collinearity test (RFC 02)

Scaffolded (interfaces only, raise NotImplementedError):
    qcc, memory_12, handshake, calculators.*
"""

__version__ = "0.1.0"
SPEC_VERSION = "0.1.0"
