import { useRef } from 'react'
import useMoment from './useMoment.js'

/** A <section> that hosts one of the kit's moments: <MomentSection moment="letters-assemble" opts={{ spread: 1 }}>. */
export default function MomentSection({ moment, opts, children, ...rest }) {
  const ref = useRef(null)
  useMoment(ref)
  return (
    <section ref={ref} data-moment={moment} data-moment-opts={opts ? JSON.stringify(opts) : undefined} {...rest}>
      {children}
    </section>
  )
}
