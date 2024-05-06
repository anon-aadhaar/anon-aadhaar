import React, { FunctionComponent, ChangeEvent, useState, useMemo } from 'react'
import styled from 'styled-components'
import { icons } from './ButtonLogo'

interface FileInputProps {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  id: string
}

export const FileInput: FunctionComponent<FileInputProps> = ({
  onChange,
  id,
}) => {
  const [fileName, setFileName] = useState<string>('Choose file')

  const blob = new Blob([icons.fileUpload], { type: 'image/svg+xml' })
  const uploadIcon = useMemo(
    () => URL.createObjectURL(blob),
    [icons.fileUpload],
  )

  return (
    <InputFile htmlFor={id}>
      <input
        type="file"
        id={id}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (!e.target.files) return
          setFileName(e.target.files[0].name)
          onChange(e)
        }}
        accept="image/*"
        hidden
      />
      <FileUploadIcon src={uploadIcon} />
      <FileName id="file-chosen">{fileName}</FileName>
    </InputFile>
  )
}

const FileName = styled.span`
  margin-left: 5px;
`

const InputFile = styled.label`
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 80%;
  border-radius: 0.5rem;
  border-width: 1px;
  border-color: black;
  max-width: 100%;
  font-size: '16px';
  line-height: 1.25rem;
  color: #111827;
  padding-top: 8px;
  padding-bottom: 8px;
  padding-left: 16px;
  padding-right: 16px;
  cursor: pointer;
  margin-top: 0.3rem;
`
export const FileUploadIcon = styled.img`
  height: 1.5rem;
  margin-right: 0.5rem;
`
