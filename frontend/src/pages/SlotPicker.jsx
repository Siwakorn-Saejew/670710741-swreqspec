import { useEffect, useState } from 'react'
import { api } from '../api/client.js'

// รองรับ: FR-BKG-01, FR-BKG-06

const PACKAGE_OPTIONS = [
  { value: 'basic', label: 'พรีเมี่ยมพื้นฐาน' },
  { value: 'standard', label: 'มาตรฐาน' },
  { value: 'premium', label: 'พรีเมี่ยม' },
]

export default function SlotPicker() {
  const today = new Date().toISOString().slice(0, 10)
  const [packageCode, setPackageCode] = useState(PACKAGE_OPTIONS[0].value)
  const [dateFrom, setDateFrom] = useState(today)
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let isMounted = true

    const run = async () => {
      setLoading(true)
      try {
        const result = await api.getSlots({ dateFrom, packageCode })
        const nextSlots = Array.isArray(result) ? result : result.slots ?? []
        if (isMounted) setSlots(nextSlots)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    run()
    return () => {
      isMounted = false
    }
  }, [dateFrom, packageCode])

  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-teal-700">เลือกแพ็กเกจและเวลา</p>
          <h2 className="text-2xl font-bold text-slate-800">จองคิวตรวจสุขภาพ</h2>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          แพ็กเกจ
          <select
            className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800"
            value={packageCode}
            onChange={(event) => setPackageCode(event.target.value)}
          >
            {PACKAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          วันที่เริ่มต้น
          <input
            type="date"
            className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
          />
        </label>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">ช่วงเวลา</h3>
          <span className="text-sm text-slate-500">{loading ? 'กำลังโหลด...' : `${slots.length} ช่วงเวลา`}</span>
        </div>

        {slots.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            ยังไม่มีช่วงเวลาให้เลือกสำหรับเงื่อนไขนี้
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {slots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-left transition hover:border-teal-400 hover:bg-teal-100"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-base font-semibold text-slate-800">{slot.start_time}</span>
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-teal-700">
                    เหลือ {slot.remaining} ที่
                  </span>
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  {slot.slot_date} • {slot.package_code}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
