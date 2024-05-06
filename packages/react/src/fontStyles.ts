import { createGlobalStyle } from 'styled-components'
import RajdhaniLight from './fonts/Rajdhani-Light.ttf'
import RajdhaniRegular from './fonts/Rajdhani-Regular.ttf'
import RajdhaniMedium from './fonts/Rajdhani-Medium.ttf'
import RajdhaniSemiBold from './fonts/Rajdhani-SemiBold.ttf'
import RajdhaniBold from './fonts/Rajdhani-Bold.ttf'

const FontStyles = createGlobalStyle`
  @font-face {
    font-family: 'Rajdhani';
    src: url(${RajdhaniLight}) format('truetype');
    font-weight: 300; // Light
    font-style: normal;
  }

  @font-face {
    font-family: 'Rajdhani';
    src: url(${RajdhaniRegular}) format('truetype');
    font-weight: 400; // Regular
    font-style: normal;
  }

  @font-face {
    font-family: 'Rajdhani';
    src: url(${RajdhaniMedium}) format('truetype');
    font-weight: 500; // Medium
    font-style: normal;
  }

  @font-face {
    font-family: 'Rajdhani';
    src: url(${RajdhaniSemiBold}) format('truetype');
    font-weight: 600; // SemiBold
    font-style: normal;
  }

  @font-face {
    font-family: 'Rajdhani';
    src: url(${RajdhaniBold}) format('truetype');
    font-weight: 700; // Bold
    font-style: normal;
  }

  body {
    font-family: 'Rajdhani', sans-serif;
  }
`

export default FontStyles
