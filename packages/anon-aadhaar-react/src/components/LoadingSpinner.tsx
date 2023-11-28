import { useState, useEffect } from 'react'
import styled from 'styled-components'

export const Spinner = () => {
  const emojis = ['🌎', '🌍', '🌏']
  const [currentEmojiIndex, setCurrentEmojiIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEmojiIndex(prevIndex => (prevIndex + 1) % emojis.length)
    }, 200)

    return () => clearInterval(interval)
  }, [emojis.length])

  return (
    <SpinnerStyle>
      <Emoji>{emojis[currentEmojiIndex]}</Emoji>
    </SpinnerStyle>
  )
}

const SpinnerStyle = styled.div`
  font-size: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Emoji = styled.div`
  transition: transform 0.25s ease-in-out;
`
