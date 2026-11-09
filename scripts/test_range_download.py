# Copyright (c) 2026 Sabareesh M (saba1207B). All Rights Reserved.
#
# This source code is proprietary and confidential.
#
# Unauthorized copying, redistribution, modification, or use — including
# any use for artificial intelligence / machine learning training —
# is strictly prohibited.
#
# See the LICENSE and COPYRIGHT files in the repository root for full terms.

import urllib.request
import sys

url = "https://datashare.ed.ac.uk/bitstream/handle/10283/3336/LA.zip?sequence=3&isAllowed=y"

req = urllib.request.Request(url, method="GET")
try:
    with urllib.request.urlopen(req) as resp:
        print("Status:", resp.status)
        print("Headers:", dict(resp.headers))
        content = resp.read(1024)
        print("First 200 bytes:", content[:200])
except Exception as e:
    print("GET request failed:", e)
