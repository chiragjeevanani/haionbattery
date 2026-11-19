import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSite } from './siteState.js'
import Arrow from './Arrow.jsx'
import { CHEM, VEHICLES, VOLTS, planPack } from './packPlan.js'

function Choice({ name, value, current, onChange, children }) {
  const checked = String(current) === String(value)
  return (
    <label className={`choice${checked ? ' is-on' : ''}`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} />
      <span>{children}</span>
    </label>
  )
}

export default function PackBuilder() {
  const uid = useId()
  const { settings, whatsappTextUrl } = useSite()
  const [vehicle, setVehicle] = useState('car')
  const [chem, setChem] = useState('nmc')
  const [v, setV] = useState(96)
  const [ah, setAh] = useState(100)

  const pickVehicle = id => {
    const x = VEHICLES.find(i => i.id === id)
    setVehicle(id)
    setV(x.v)
    setAh(x.ah)
    setChem(x.chem)
  }
  const plan = planPack({ v, ah, chem })
  const vehicleLabel = VEHICLES.find(i => i.id === vehicle).label

  const summary = `${plan.packV} V ${plan.packAh} Ah ${plan.chem.label} pack (${plan.s}S${plan.p}P, ${plan.kwh} kWh). Vehicle: ${vehicleLabel}`
  const quote = `/custom?${new URLSearchParams({ vehicle: vehicleLabel, voltage: String(plan.packV), capacity: String(plan.packAh), chemistry: plan.chem.label })}`
  const whatsapp = whatsappTextUrl(`Hello ${settings.siteName}, I would like a quote for a ${summary}.`)

  return (
    <div className="builder grid grid--top">
      <div className="builder__controls span-5">
        <fieldset className="builder__group">
          <legend>Vehicle</legend>
          <div className="choices">
            {VEHICLES.map(x => <Choice key={x.id} name={`${uid}-vehicle`} value={x.id} current={vehicle} onChange={pickVehicle}>{x.label}</Choice>)}
          </div>
        </fieldset>
        <fieldset className="builder__group">
          <legend>Chemistry</legend>
          <div className="choices">
            {Object.entries(CHEM).map(([id, c]) => <Choice key={id} name={`${uid}-chem`} value={id} current={chem} onChange={setChem}>{c.label}</Choice>)}
          </div>
        </fieldset>
        <fieldset className="builder__group">
          <legend>Voltage</legend>
          <div className="choices">
            {VOLTS.map(x => <Choice key={x} name={`${uid}-volt`} value={x} current={v} onChange={val => setV(Number(val))}>{x} V</Choice>)}
          </div>
        </fieldset>
        <div className="builder__group">
          <label className="builder__range" htmlFor={`${uid}-ah`}>
            <span>Capacity</span>
            <output htmlFor={`${uid}-ah`}>{ah} Ah</output>
          </label>
          <input id={`${uid}-ah`} type="range" min="5" max="200" step="5" value={ah} onChange={e => setAh(Number(e.target.value))} />
        </div>
        <p className="t-small muted">Indicative layout with a {plan.chem.cell}. We confirm the final design with you.</p>
      </div>

      <div className="builder__panel span-7">
        <dl className="builder__stats">
          <div><dt>Layout</dt><dd>{plan.s}S {plan.p}P</dd></div>
          <div><dt>Voltage</dt><dd>{plan.packV} V</dd></div>
          <div><dt>Capacity</dt><dd>{plan.packAh} Ah</dd></div>
          <div><dt>Energy</dt><dd>{plan.kwh} kWh</dd></div>
        </dl>
        <div className="builder__cells" role="img" aria-label={`${plan.cells} cells: ${plan.s} in series, ${plan.p} in parallel`}>
          <div key={`${plan.s}-${plan.p}-${chem}`} className="cellgrid" style={{ '--cols': plan.s, '--rows': plan.p }}>
            {Array.from({ length: plan.cells }, (_, i) => <i key={i} style={{ '--i': i }} />)}
          </div>
        </div>
        <div className="builder__foot">
          <p><b>{plan.cells}</b> cells</p>
          <div className="btn-row">
            <Link className="btn btn--primary" to={quote}>Get a quote for this pack<Arrow /></Link>
            <a className="btn btn--secondary" href={whatsapp} target="_blank" rel="noopener noreferrer">Send on WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  )
}
