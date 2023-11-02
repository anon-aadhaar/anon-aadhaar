import React, { FunctionComponent } from 'react'
import styled from 'styled-components'

interface ErrorToastProps {
  message: string
}

export const ErrorToast: FunctionComponent<ErrorToastProps> = ({ message }) => {
  return (
    <Box>
      <Message>{message}</Message>
    </Box>
  )
}

const Box = styled.div`
  display: flex;
  position: absolute;
  width: 90%;
  margin-top: 5px;
  border-radius: 5px;
  background-color: #efc8c8;
  padding: 4px;
`

const Message = styled.div`
  margin-left: 3px;
  font-size: 0.875rem;
  color: #a00f0f;
`

// const InputFile = styled.div`
//   display: flex;
//   align-items: center;
//   overflow: hidden;
//   white-space: nowrap;
//   text-overflow: ellipsis;
//   max-width: 80%;
//   border-radius: 0.5rem;
//   border-width: 1px;
//   border-color: #d1d5db;
//   max-width: 100%;
//   font-size: 0.875rem;
//   line-height: 1.25rem;
//   color: #111827;
//   background-color: #f9fafb;
//   cursor: pointer;
//   margin-top: 0.3rem;
// `

// const UploadButton = styled.label`
//   color: #111827;
//   background-color: #345c93;
//   color: white;
//   padding: 0.5rem;
//   font-family: sans-serif;
//   cursor: pointer;
// `
