from pathlib import Path

p = Path("app/page.tsx")
s = p.read_text()

s = s.replace(
'''const match = text.match(
        /^---\\s*title:\\s*"(.+)"\\s*date:\\s*"(.+)"\\s*excerpt:\\s*"(.+)"\\s*---/s
      );''',
'''const match = text.match(
        /^---[\\s\\S]*?title:\\s*"([^"]+)"[\\s\\S]*?date:\\s*"([^"]+)"[\\s\\S]*?excerpt:\\s*"([^"]+)"[\\s\\S]*?---/
      );'''
)

p.write_text(s)
