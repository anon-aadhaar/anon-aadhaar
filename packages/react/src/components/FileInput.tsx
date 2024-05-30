import React, {
  FunctionComponent,
  ChangeEvent,
  useState,
  SetStateAction,
  Dispatch,
  useRef,
} from 'react'
import styled from 'styled-components'
import { icons } from './MainIcons'
import { AadhaarQRValidation } from '../types'
import { createBlobURL } from '../util'

interface FileInputProps {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  id: string
  setQrStatus: Dispatch<SetStateAction<AadhaarQRValidation | null>>
  qrStatus: AadhaarQRValidation | null
}

export const FileInput: FunctionComponent<FileInputProps> = ({
  onChange,
  id,
  setQrStatus,
  qrStatus,
}) => {
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadIcon = createBlobURL(icons.fileUpload)
  const xIcon = createBlobURL(icons.xBlack)

  const clearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      setFileName(null)
      setQrStatus(null)
    }
  }

  return (
    <>
      <InputFile htmlFor={id}>
        <input
          type="file"
          id={id}
          ref={fileInputRef}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (!e.target.files) return
            setFileName(e.target.files[0].name)
            onChange(e)
          }}
          accept="image/*"
          hidden
        />

        <FileUploadIcon src={uploadIcon} />
        <FileName id="file-chosen">Choose file</FileName>
      </InputFile>
      {fileName &&
        (() => {
          switch (qrStatus) {
            case AadhaarQRValidation.ERROR_PARSING_QR:
              return (
                <>
                  <InputFileWrong>
                    <FileName id="file-chosen">{fileName}</FileName>
                    <button onClick={clearFileInput}>
                      <FileUploadIcon src={xIcon} />
                    </button>
                  </InputFileWrong>
                  <DocumentResultWrong>Invalid QR Code.</DocumentResultWrong>
                </>
              )
            case AadhaarQRValidation.SIGNATURE_VERIFIED:
              return (
                <>
                  <InputFileCorrect>
                    <FileName id="file-chosen">{fileName}</FileName>
                    <button onClick={clearFileInput}>
                      <FileUploadIcon src={xIcon} />
                    </button>
                  </InputFileCorrect>
                  <DocumentResultCorrect>Valid QR Code.</DocumentResultCorrect>
                </>
              )
            case AadhaarQRValidation.QR_CODE_SCANNED:
              return (
                <>
                  <FileNameContainer>
                    <FileName id="file-chosen">{fileName}</FileName>
                    <button onClick={clearFileInput}>
                      <FileUploadIcon src={xIcon} />
                    </button>
                  </FileNameContainer>
                  <DocumentResult>Verifying QR Code.</DocumentResult>
                </>
              )
          }
        })()}
    </>
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
  border-radius: 4px;
  border-width: 1px;
  border-color: black;
  max-width: 100%;
  font-size: '16px';
  line-height: 1.25rem;
  color: #111827;
  padding-top: 6px;
  padding-bottom: 6px;
  padding-left: 14px;
  padding-right: 14px;
  cursor: pointer;
  margin-top: 0.3rem;
`

const FileNameContainer = styled.label`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 80%;
  border-radius: 4px;
  border-width: 1px;
  border-color: black;
  max-width: 100%;
  font-size: '16px';
  line-height: 1.25rem;
  color: #111827;
  padding-top: 6px;
  padding-bottom: 6px;
  padding-left: 14px;
  padding-right: 14px;
  cursor: pointer;
  margin-top: 0.3rem;
`

const InputFileCorrect = styled.label`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 80%;
  border-radius: 4px;
  border-width: 2px;
  border-color: #00bf06;
  max-width: 100%;
  font-size: '16px';
  line-height: 1.25rem;
  color: #111827;
  padding-top: 6px;
  padding-bottom: 6px;
  padding-left: 14px;
  padding-right: 14px;
  cursor: pointer;
  margin-top: 0.3rem;
`

const InputFileWrong = styled.label`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 80%;
  border-radius: 4px;
  border-width: 2px;
  border-color: #ef4444;
  max-width: 100%;
  font-size: '16px';
  line-height: 1.25rem;
  color: #111827;
  padding-top: 6px;
  padding-bottom: 6px;
  padding-left: 14px;
  padding-right: 14px;
  cursor: pointer;
  margin-top: 0.3rem;
`

export const FileUploadIcon = styled.img`
  height: 1.5rem;
`
const DocumentResultCorrect = styled.div`
  color: #00bf06;
  position: absolute;
  font-size: 0.875rem;
  margin-top: 4px;
`

const DocumentResult = styled.div`
  color: #717686;
  position: absolute;
  font-size: 0.875rem;
  margin-top: 4px;
`
const DocumentResultWrong = styled.div`
  color: #ef4444;
  position: absolute;
  font-size: 0.875rem;
  margin-top: 4px;
`
