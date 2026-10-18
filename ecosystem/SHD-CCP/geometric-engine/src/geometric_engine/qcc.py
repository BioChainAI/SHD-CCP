"""Quaternion Chain Compression (QCC) and lossless TQF collinear stream pruning (RFC 02)."""


def compress(chain):
    raise NotImplementedError("QCC: pending RFC 02 normative text")


def prune_collinear(stream):
    """Drop interior points whose Gram-TQF with their neighbours is exactly 0."""
    raise NotImplementedError("TQF stream pruner: pending RFC 02 normative text")
