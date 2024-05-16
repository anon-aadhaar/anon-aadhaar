import { QrReader } from 'react-qr-reader'
import React, {
  Dispatch,
  SetStateAction,
  FunctionComponent,
  useState,
} from 'react'
import { AadhaarQRValidation } from '../types'

interface ScanQRProps {
  setQrData: Dispatch<SetStateAction<string | null>>
  setQrStatus: Dispatch<SetStateAction<AadhaarQRValidation | null>>
}

export const ScanQR: FunctionComponent<ScanQRProps> = ({
  setQrData,
  setQrStatus,
}) => {
  const [showScanner, setShowScanner] = useState(true)

  return showScanner ? (
    <QrReader
      containerStyle={{ width: '90%' }}
      videoStyle={{ height: '70%' }}
      scanDelay={1000}
      constraints={{ facingMode: 'environment' }}
      onResult={(result, error) => {
        if (result?.getText() && result?.getText() !== '') {
          setQrStatus(AadhaarQRValidation.QR_CODE_SCANNED)
          setQrData(result.getText())
          setShowScanner(false)
        }

        if (error) {
          console.info(error)
        }
      }}
    />
  ) : null
}
