import { useState } from 'react'
import { Button } from 'antd'

export default function Counter() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <h1>Counter</h1>
      <p>Count: {count}</p>
      <Button onClick={() => setCount(count + 1)}>Increment</Button>
    </div>
  )
}
