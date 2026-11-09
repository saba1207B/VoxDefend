# Copyright (c) 2026 Sabareesh M (saba1207B). All Rights Reserved.
#
# This source code is proprietary and confidential.
#
# Unauthorized copying, redistribution, modification, or use — including
# any use for artificial intelligence / machine learning training —
# is strictly prohibited.
#
# See the LICENSE and COPYRIGHT files in the repository root for full terms.

"""
Script to extract official ASVspoof 2019 LA protocols and LICENSE directly from
the official University of Edinburgh DataShare LA.zip using Buffered HTTP Range requests.
"""

import io
import os
import sys
import json
import zipfile
import urllib.request
from pathlib import Path

DATA_URL = "https://datashare.ed.ac.uk/bitstream/handle/10283/3336/LA.zip?sequence=3&isAllowed=y"
KNOWN_TOTAL_SIZE = 7640952520  # Verified Content-Length from server

TARGET_DIR = Path("data/asvspoof2019_la")
PROTOCOLS_DIR = TARGET_DIR / "ASVspoof2019_LA_cm_protocols"
PROTOCOLS_DIR.mkdir(parents=True, exist_ok=True)

TARGET_FILENAMES = {
    "ASVspoof2019.LA.cm.train.trn.txt",
    "ASVspoof2019.LA.cm.dev.trl.txt",
    "ASVspoof2019.LA.cm.eval.trl.txt",
    "LICENSE.txt"
}


class BufferedRangeFile(io.RawIOBase):
    """File-like wrapper with a 2MB read-ahead cache over HTTP Range requests."""
    def __init__(self, url: str, total_size: int = KNOWN_TOTAL_SIZE, headers: dict = None):
        self.url = url
        self.total_size = total_size
        self.headers = headers or {}
        self.headers.setdefault("User-Agent", "VocalShield-PreTraining-Gate/1.0")
        
        self.pos = 0
        self.buffer = b""
        self.buffer_start = 0
        self.cache_block_size = 2 * 1024 * 1024  # 2 MB chunks
        print(f"[OK] Initialized BufferedRangeFile for {url} ({self.total_size / (1024*1024):.2f} MB)", flush=True)

    def seekable(self) -> bool:
        return True

    def readable(self) -> bool:
        return True

    def seek(self, offset: int, whence: int = io.SEEK_SET) -> int:
        if whence == io.SEEK_SET:
            self.pos = offset
        elif whence == io.SEEK_CUR:
            self.pos += offset
        elif whence == io.SEEK_END:
            self.pos = self.total_size + offset
        else:
            raise ValueError(f"Invalid whence: {whence}")
        return self.pos

    def tell(self) -> int:
        return self.pos

    def _fetch_range(self, start: int, end: int) -> bytes:
        req = urllib.request.Request(
            self.url,
            headers={
                **self.headers,
                "Range": f"bytes={start}-{end}"
            }
        )
        with urllib.request.urlopen(req) as resp:
            return resp.read()

    def readinto(self, b) -> int:
        size = len(b)
        if size == 0 or self.pos >= self.total_size:
            return 0

        # Check if requested range is in buffer
        buf_end = self.buffer_start + len(self.buffer)
        if self.buffer_start <= self.pos < buf_end:
            available = buf_end - self.pos
            chunk_size = min(size, available)
            offset_in_buf = self.pos - self.buffer_start
            b[:chunk_size] = self.buffer[offset_in_buf:offset_in_buf + chunk_size]
            self.pos += chunk_size
            return chunk_size

        # Buffer miss: fetch next block
        fetch_size = max(size, self.cache_block_size)
        start = self.pos
        end = min(self.pos + fetch_size - 1, self.total_size - 1)
        
        # print(f"  [HTTP RANGE] Fetching bytes {start}-{end} ...", flush=True)
        new_data = self._fetch_range(start, end)
        self.buffer = new_data
        self.buffer_start = start

        chunk_size = min(size, len(new_data))
        b[:chunk_size] = new_data[:chunk_size]
        self.pos += chunk_size
        return chunk_size

    def read(self, size: int = -1) -> bytes:
        if size == -1 or self.pos + size > self.total_size:
            size = self.total_size - self.pos
        if size <= 0:
            return b""
        
        buf = bytearray(size)
        n = self.readinto(buf)
        return bytes(buf[:n])


def download_official_protocols():
    print("==================================================================", flush=True)
    print("DOWNLOADING OFFICIAL ASVSPOOF 2019 LA PROTOCOLS & LICENSE", flush=True)
    print("Source: University of Edinburgh DataShare", flush=True)
    print(f"URL: {DATA_URL}", flush=True)
    print("==================================================================", flush=True)

    rf = BufferedRangeFile(DATA_URL)
    
    print("\nReading ZIP central directory via HTTP Range request...", flush=True)
    with zipfile.ZipFile(rf) as zf:
        file_list = zf.infolist()
        print(f"[OK] Central directory parsed: {len(file_list)} total archive entries found.", flush=True)

        found_targets = {}
        for member in file_list:
            fname = Path(member.filename).name
            if fname in TARGET_FILENAMES:
                found_targets[fname] = member

        print(f"Found {len(found_targets)} matching target files:", flush=True)
        for fname, member in found_targets.items():
            print(f" - {member.filename} ({member.file_size} bytes)", flush=True)

        # Extract target files
        for fname in TARGET_FILENAMES:
            if fname not in found_targets:
                print(f"[WARN] Target file {fname} not found in archive!", flush=True)
                continue

            member = found_targets[fname]
            if fname.endswith(".txt") and "cm" in fname:
                out_path = PROTOCOLS_DIR / fname
            else:
                out_path = TARGET_DIR / fname

            print(f"Extracting {member.filename} -> {out_path} ...", flush=True)
            with zf.open(member) as source, open(out_path, "wb") as target:
                target.write(source.read())
            print(f"[OK] Saved {out_path} ({out_path.stat().st_size} bytes)", flush=True)

    print("\n[OK] All official protocol and license files extracted successfully.", flush=True)


if __name__ == "__main__":
    download_official_protocols()
