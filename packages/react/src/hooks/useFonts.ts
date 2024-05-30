import { useEffect } from 'react'

export const useFonts = () => {
  useEffect(() => {
    if (window) {
      const element = document.createElement('link')
      element.setAttribute('rel', 'stylesheet')
      element.setAttribute('type', 'text/css')
      element.setAttribute(
        'href',
        'https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap',
      )
      document.getElementsByTagName('head')[0].appendChild(element)
    }
  }, [])
}
