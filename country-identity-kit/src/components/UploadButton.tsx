import { FunctionComponent, ChangeEvent } from "react";
import styled from "styled-components";

interface FileInputProps {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const FileInput: FunctionComponent<FileInputProps> = ({ onChange }) => {
  return (
    <InputFile>
      <input type="file" onChange={onChange} />
    </InputFile>
  );
};

const InputFile = styled.div`
  border-radius: 0.5rem;
  border-width: 1px;
  border-color: #d1d5db;
  padding: 5px;
  width: 100%;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #111827;
  background-color: #f9fafb;
  cursor: pointer;
  padding-top: 10px;
  padding-bottom: 10px;
`;
