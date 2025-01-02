import { AppProps } from 'next/app'
import '../styles/index.css'
import "rehype-obsidian-callout/styles/styles.css";


export default function MyApp({ Component, pageProps }: AppProps) {
    const style = `
    :root {
        --callout-note-rgb: 0, 176, 255;
        --callout-success-rgb: 0, 200, 83;
        --callout-warning-rgb: 255, 145, 0;
        --callout-error-rgb: 255, 0, 0;
        --callout-quote-rgb: 158, 158, 158;
    }
    `

  return (
    <>
      <Component {...pageProps} style={style}/>
    </>
  )
}
