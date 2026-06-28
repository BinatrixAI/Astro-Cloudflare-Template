import { useState } from "react";

interface Day {
  id: string;
  name: string;
  date: string;
  details: string;
}

interface Props {
  days: Day[];
  /** Unit price in MAJOR units (e.g. 70). */
  priceMajor: number;
  maxPerDay: number;
  currencySymbol?: string;
}

const emailOk = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());

/**
 * Booking card for the Summer Mechinot Tour — faithful to mechina/8.html:
 * day-card toggle reveals a stepper, live order summary + total, buyer details,
 * consent, then POSTs a server-priced cart to /api/checkout.
 */
export default function TourRegistration({ days, priceMajor, maxPerDay, currencySymbol = "₪" }: Props) {
  const [qty, setQty] = useState<Record<string, number>>({});
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [cc, setCc] = useState("+972");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const seats = Object.values(qty).reduce((a, b) => a + b, 0);
  const total = seats * priceMajor;
  const valid =
    seats > 0 && first.trim() !== "" && last.trim() !== "" && emailOk(email) && phone.trim() !== "" && consent;

  const toggleDay = (id: string) =>
    setQty((q) => ({ ...q, [id]: (q[id] ?? 0) > 0 ? 0 : 1 }));
  const inc = (id: string) =>
    setQty((q) => ({ ...q, [id]: Math.min((q[id] ?? 0) + 1, maxPerDay) }));
  const dec = (id: string) =>
    setQty((q) => ({ ...q, [id]: Math.max((q[id] ?? 0) - 1, 1) }));

  async function pay() {
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    const items = days.filter((d) => (qty[d.id] ?? 0) > 0).map((d) => ({ id: d.id, qty: qty[d.id] }));
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items,
          name: first,
          lname: last,
          email,
          phone: `${cc} ${phone}`.trim(),
          country: cc.slice(0, 4),
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  const payLabel = submitting
    ? "Redirecting…"
    : seats === 0
      ? "Pick a day to continue"
      : valid
        ? `Continue to payment · ${currencySymbol}${total}`
        : "Complete your details";

  const onBlurBad = (e: React.FocusEvent<HTMLInputElement>, ok: boolean) => {
    e.currentTarget.classList.toggle("bad", e.currentTarget.value !== "" && !ok);
  };

  return (
    <div className="ticket">
      <div className="tk-body">
        <div className="label">Choose your day(s)</div>
        <div className="days">
          {days.map((d) => {
            const on = (qty[d.id] ?? 0) > 0;
            return (
              <div className={`day-card${on ? " on" : ""}`} data-day={d.id} key={d.id}>
                <button className="day-pick" type="button" onClick={() => toggleDay(d.id)}>
                  <span className="dp-txt">
                    <span className="day">{d.date}</span>
                    <span className="left">{d.details}</span>
                  </span>
                  <span className="tick"></span>
                </button>
                <div className="day-qty" hidden={!on}>
                  <span className="ql">How many on {d.name}?</span>
                  <div className="stepper">
                    <button className="dq-minus" type="button" aria-label="Remove a seat" onClick={() => dec(d.id)}>
                      −
                    </button>
                    <span className="n dq-n">{qty[d.id] ?? 0}</span>
                    <button className="dq-plus" type="button" aria-label="Add a seat" onClick={() => inc(d.id)}>
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="label mt">Your details</div>
        <div className="fields">
          <div className="row2">
            <label className="field">
              <span className="fl">First name</span>
              <input
                className="input"
                type="text"
                autoComplete="given-name"
                placeholder="First name"
                value={first}
                onInput={(e) => setFirst(e.currentTarget.value)}
                onBlur={(e) => onBlurBad(e, e.currentTarget.value.trim() !== "")}
              />
            </label>
            <label className="field">
              <span className="fl">Last name</span>
              <input
                className="input"
                type="text"
                autoComplete="family-name"
                placeholder="Last name"
                value={last}
                onInput={(e) => setLast(e.currentTarget.value)}
                onBlur={(e) => onBlurBad(e, e.currentTarget.value.trim() !== "")}
              />
            </label>
          </div>
          <label className="field">
            <span className="fl">Email</span>
            <input
              className="input"
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={email}
              onInput={(e) => setEmail(e.currentTarget.value)}
              onBlur={(e) => onBlurBad(e, emailOk(e.currentTarget.value))}
            />
          </label>
          <label className="field">
            <span className="fl">WhatsApp phone</span>
            <span className="phone">
              <select
                className="input f-cc"
                aria-label="Country code"
                value={cc}
                onChange={(e) => setCc(e.currentTarget.value)}
              >
                <option value="+972">IL +972</option>
                <option value="+1">US +1</option>
                <option value="+44">UK +44</option>
                <option value="+1ca">CA +1</option>
                <option value="+61">AU +61</option>
                <option value="+33">FR +33</option>
                <option value="+">Other</option>
              </select>
              <input
                className="input f-phone"
                type="tel"
                autoComplete="tel"
                placeholder="50 123 4567"
                value={phone}
                onInput={(e) => setPhone(e.currentTarget.value)}
                onBlur={(e) => onBlurBad(e, e.currentTarget.value.trim() !== "")}
              />
            </span>
          </label>
          <label className="consent">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.currentTarget.checked)} />
            <span>
              I agree to the <a href="#details">Participation Terms</a> and Cancellation &amp; Refund Policy.
            </span>
          </label>
        </div>
      </div>
      <div className="tear"></div>
      <div className="tk-stub">
        <ul className="summary">
          {days
            .filter((d) => (qty[d.id] ?? 0) > 0)
            .map((d) => (
              <li key={d.id}>
                <span>
                  {d.name} <b>× {qty[d.id]}</b>
                </span>
                <span>
                  {currencySymbol}
                  {(qty[d.id] ?? 0) * priceMajor}
                </span>
              </li>
            ))}
        </ul>
        <div className="total">
          <div className="t-label">Total</div>
          <div className="amt">
            <span className="cur">{currencySymbol}</span>
            <span className="t-amount">{total}</span>
          </div>
        </div>
        {error && (
          <p className="trust" role="alert" style={{ color: "var(--bad)" }}>
            {error}
          </p>
        )}
        <button className="pay" type="button" disabled={!valid || submitting} onClick={pay}>
          {payLabel}
        </button>
        <p className="trust">
          <b>Secure payment.</b> Free cancellation through July 5. Full participant details come right after you book.
        </p>
      </div>
    </div>
  );
}
