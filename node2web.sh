#!/bin/bash

cat "proxy.js"      | sed -ne '/web-start/,/web-end/ p' > "$1/inject.js"
cat "array.js"      | sed -ne '/web-start/,/web-end/ p' >> "$1/inject.js"
cat "graph.js"      | sed -ne '/web-start/,/web-end/ p' >> "$1/inject.js"
cat "value.js"      | sed -ne '/web-start/,/web-end/ p' >> "$1/inject.js"
cat "function.js"   | sed -ne '/web-start/,/web-end/ p' >> "$1/inject.js"
cat "inject.js"     | sed -ne '/web-start/,/web-end/ p' >> "$1/inject.js"
cat "dot.js"        | sed -ne '/web-start/,/web-end/ p' >> "$1/inject.js"
