import { AppProps } from 'next/app'
import '../styles/globals.css'


export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps}/>
        <div className="callout-type-info callout-block">
            <div className="callout-title-section"><p
                className="callout-title">Info</p></div>
            <div className="callout-content-section"><p>hello callout</p></div>
        </div>
    </>
  )
}
