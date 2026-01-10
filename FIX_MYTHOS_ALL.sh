#!/usr/bin/env bash
set -u
set +e

cd "$(dirname "$0")"

ts="$(date +%Y%m%d_%H%M%S)"
mkdir -p "_backup_$ts"
cp -a engine "_backup_$ts/engine" 2>/dev/null

echo "[OK] Backup: _backup_$ts/engine"

cat > engine/grammar.lark <<'LARK'
%import common.CNAME -> NAME
%import common.SIGNED_NUMBER -> NUMBER
%import common.WS_INLINE
%import common.NEWLINE -> _NL
%ignore WS_INLINE

EXPR: /[^,\n\)\}][^,\n\)\}]*/

start: (_NL | stmt)*

stmt: const_stmt _NL*
    | law_stmt   _NL*

const_stmt: "const" NAME "=" expr                     -> const_stmt
law_stmt: "law" NAME "priority" NUMBER "when" expr "do" action_list  -> law_stmt

action_list: action ("," action)*                     -> action_list
action: assign | call

assign: NAME ASSIGN_OP expr                           -> assign
ASSIGN_OP: "="|"+="|"-="|"*="|"/="

call: NAME "(" [args] ")"                             -> call
args: expr ("," expr)*                                -> args

expr: EXPR                                            -> expr
LARK

cat > engine/compiler.py <<'PY'
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Any

from lark import Lark, Transformer

from .laws import Law, Action
from .safeexpr import compile_expr

GRAMMAR_PATH = __file__.replace("compiler.py", "grammar.lark")


def _load_grammar() -> str:
    with open(GRAMMAR_PATH, "r", encoding="utf-8") as f:
        return f.read()


_PARSER = Lark(_load_grammar(), parser="lalr", maybe_placeholders=False, propagate_positions=True)


class _AST(Transformer):
    def start(self, items):
        consts = {}
        laws = []
        for it in items:
            if it is None:
                continue
            if isinstance(it, tuple) and it[0] == "const":
                consts[it[1]] = it[2]
            elif isinstance(it, Law):
                laws.append(it)
        return {"consts": consts, "laws": laws}

    def const_stmt(self, items):
        name = str(items[0])
        expr_src = str(items[1]).strip()
        return ("const", name, compile_expr(expr_src))

    def law_stmt(self, items):
        name = str(items[0])
        prio = int(float(str(items[1])))
        when_src = str(items[2]).strip()
        actions = items[3]
        return Law(name=name, priority=prio, when=compile_expr(when_src), actions=actions)

    def action_list(self, items):
        return items

    def assign(self, items):
        var = str(items[0])
        op = str(items[1])
        expr_src = str(items[2]).strip()
        return Action(kind="assign", name=var, op=op, expr=compile_expr(expr_src))

    def call(self, items):
        fname = str(items[0])
        args = []
        if len(items) > 1 and items[1] is not None:
            args = items[1]
        return Action(kind="call", name=fname, args=args)

    def args(self, items):
        return [compile_expr(str(x).strip()) for x in items]

    def expr(self, items):
        return str(items[0])

    def NAME(self, t): return str(t)
    def NUMBER(self, t): return str(t)


@dataclass
class CompiledProgram:
    consts: Dict[str, Any]
    laws: List[Law]


def compile_program(src: str) -> CompiledProgram:
    tree = _PARSER.parse(src + "\n")
    ast = _AST().transform(tree)
    return CompiledProgram(consts=ast["consts"], laws=ast["laws"])
PY

cat > engine/safeexpr.py <<'PY'
from __future__ import annotations

from dataclasses import dataclass
import ast
import math
import random
from typing import Any, Dict, Mapping, Optional


@dataclass(frozen=True)
class CompiledExpr:
    src: str
    node: ast.AST


SAFE_FUNCS = {
    "min", "max", "abs", "round",
    "clamp", "lerp",
    "sin", "cos", "tan", "sqrt", "log", "exp",
    "rand", "randint",
}


_ALLOWED_NODES = (
    ast.Expression,
    ast.BinOp, ast.UnaryOp,
    ast.BoolOp, ast.Compare,
    ast.Name, ast.Load,
    ast.Constant,
    ast.Add, ast.Sub, ast.Mult, ast.Div, ast.Mod, ast.Pow,
    ast.USub, ast.UAdd, ast.Not,
    ast.And, ast.Or,
    ast.Eq, ast.NotEq, ast.Lt, ast.LtE, ast.Gt, ast.GtE,
    ast.Call,
)


def clamp(x, lo, hi):
    return lo if x < lo else hi if x > hi else x


def lerp(a, b, t):
    return a + (b - a) * t


def rand():
    return random.random()


def randint(a, b):
    return random.randint(int(a), int(b))


_SAFE_IMPL: Dict[str, Any] = {
    "min": min, "max": max, "abs": abs, "round": round,
    "clamp": clamp, "lerp": lerp,
    "sin": math.sin, "cos": math.cos, "tan": math.tan,
    "sqrt": math.sqrt, "log": math.log, "exp": math.exp,
    "rand": rand, "randint": randint,
}


def _validate(node: ast.AST) -> None:
    for n in ast.walk(node):
        if not isinstance(n, _ALLOWED_NODES):
            raise ValueError(f"Unsafe/unsupported expression node: {type(n).__name__}")
        if isinstance(n, ast.Call):
            if not isinstance(n.func, ast.Name):
                raise ValueError("Unsafe call target (only plain function names allowed)")
            fn = n.func.id
            if fn not in SAFE_FUNCS:
                raise ValueError(f"Function not allowed: {fn}")


def compile_expr(src: str) -> CompiledExpr:
    s = (src or "").strip()
    if not s:
        s = "False"
    try:
        node = ast.parse(s, mode="eval")
    except SyntaxError as e:
        raise ValueError(f"Invalid expression syntax: {e}") from e
    _validate(node)
    return CompiledExpr(src=s, node=node)


def eval_expr(compiled: CompiledExpr, env: Optional[Mapping[str, Any]] = None) -> Any:
    scope = dict(_SAFE_IMPL)
    if env:
        scope.update(dict(env))
    code = compile(compiled.node, "<mythos_expr>", "eval")
    return eval(code, {"__builtins__": {}}, scope)
PY

python3 - <<'PY'
from engine.compiler import compile_program
demo = """\
const W = 256
const DT = 1.0
law gravity priority 10 when rand() > 0.2 do x += 1, y = y + 1
"""
p = compile_program(demo)
print("SANITY_OK", len(p.laws), len(p.consts))
PY

echo "[OK] Patched. Starting streamlit (logs -> streamlit_$ts.log)"
( streamlit run app.py 2>&1 | tee "streamlit_$ts.log" )
echo "[INFO] Streamlit stopped. Log: streamlit_$ts.log"
