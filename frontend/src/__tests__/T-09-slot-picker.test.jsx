import { render, screen } from '@testing-library/react'
import SlotPicker from '../pages/SlotPicker.jsx'
import * as client from '../api/client.js'

// ตรวจว่า task T-09: select package และ load slot list จาก API จำลอง

test('T-09 loads mocked slot options with remaining capacity', async () => {
  vi.spyOn(client.api, 'getSlots').mockResolvedValue({
    slots: [
      { id: 101, slot_date: '2026-09-23', start_time: '09:00', package_code: 'basic', remaining: 3 },
      { id: 102, slot_date: '2026-09-23', start_time: '10:30', package_code: 'basic', remaining: 1 },
    ],
  })

  render(<SlotPicker />)

  expect(await screen.findByText('จองคิวตรวจสุขภาพ')).toBeTruthy()
  expect(screen.getByText('ช่วงเวลา')).toBeTruthy()
  expect(await screen.findByText('09:00')).toBeTruthy()
  expect(screen.getByText('เหลือ 3 ที่')).toBeTruthy()
})
