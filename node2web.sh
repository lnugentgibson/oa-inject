#!/bin/bash

cat "proxy.js"      | sed -ne '/web-start/,/web-end/ p' > "$1/inject.js"
cat "graph.js"      | sed -ne '/web-start/,/web-end/ p' >> "$1/inject.js"
cat "value.js"      | sed -ne '/web-start/,/web-end/ p' >> "$1/inject.js"
cat "function.js"   | sed -ne '/web-start/,/web-end/ p' >> "$1/inject.js"
cat "inject.js"     | sed -ne '/web-start/,/web-end/ p' >> "$1/inject.js"

cat "base.js"       | sed -ne '/web-start/,/web-end/ p' > "$1/base.js"

cat "js.js"         | sed -ne '/web-start/,/web-end/ p' > "$1/js.js"

cat "$1/inject.js"  >  "$1/oa-inject.js"
cat "$1/base.js"    >> "$1/oa-inject.js"
cat "$1/js.js"      >> "$1/oa-inject.js"
