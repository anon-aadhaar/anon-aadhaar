import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { icons } from '../LoaderIcons'

export const LoaderView: React.FC = () => {
  const [iconsState, setIconsState] = useState({
    topLeft: false,
    topRight: false,
    bottomLeft: false,
    bottomRight: false,
  })

  const createBlobURL = (icon: any) => {
    const blob = new Blob([icon], { type: 'image/svg+xml' })
    return URL.createObjectURL(blob)
  }

  const iconsUrl = useMemo(
    () => ({
      topLeft: createBlobURL(icons.topLeft),
      topLeftPlain: createBlobURL(icons.topLeftPlain),
      topRight: createBlobURL(icons.topRight),
      topRightPlain: createBlobURL(icons.topRightPlain),
      bottomLeft: createBlobURL(icons.bottomLeft),
      bottomLeftPlain: createBlobURL(icons.bottomLeftPlain),
      bottomRight: createBlobURL(icons.bottomRight),
      bottomRightPlain: createBlobURL(icons.bottomRightPlain),
    }),
    [icons],
  )

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIconsState(prevState => {
        const newState = { ...prevState }
        if (!newState.topLeft) {
          newState.topLeft = true
        } else if (!newState.topRight) {
          newState.topRight = true
        } else if (!newState.bottomRight) {
          newState.bottomRight = true
        } else if (!newState.bottomLeft) {
          newState.bottomLeft = true
        } else {
          return {
            topLeft: false,
            topRight: false,
            bottomLeft: false,
            bottomRight: false,
          }
        }
        return newState
      })
    }, 1000)

    return () => {
      clearInterval(intervalId)
      // Clean up URLs to prevent memory leaks
      Object.values(iconsUrl).forEach(URL.revokeObjectURL)
    }
  }, [iconsUrl])

  return (
    <MainContainer>
      <LoaderContainer>
        <TopContainer>
          <Icon
            src={iconsState.topLeft ? iconsUrl.topLeftPlain : iconsUrl.topLeft}
            alt="Top left icon"
          />
          <Icon
            src={
              iconsState.topRight ? iconsUrl.topRightPlain : iconsUrl.topRight
            }
            alt="Top right icon"
          />
        </TopContainer>
        <BottomContainer>
          <Icon
            src={
              iconsState.bottomLeft
                ? iconsUrl.bottomLeftPlain
                : iconsUrl.bottomLeft
            }
            alt="Bottom left icon"
          />
          <Icon
            src={
              iconsState.bottomRight
                ? iconsUrl.bottomRightPlain
                : iconsUrl.bottomRight
            }
            alt="Bottom right icon"
          />
        </BottomContainer>
      </LoaderContainer>
    </MainContainer>
  )
}

const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
`

const TopContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
`

const BottomContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
`

const Icon = styled.img`
  height: 65px;
`

const MainContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  width: 100%;
`
