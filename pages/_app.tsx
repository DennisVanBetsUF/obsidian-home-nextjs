import { AppProps } from 'next/app'
import '../styles/index.css'
import "rehype-obsidian-callout/styles/styles.css";


export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
    </>
  )
}
