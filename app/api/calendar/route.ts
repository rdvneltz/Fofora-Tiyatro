import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Gün adından bir sonraki tarihi hesaplar (0=Pazar...6=Cumartesi), takvim boşken örnek kayıtları oluşturmak için.
function nextWeekday(dayOfWeek: number, hour: number, minute: number) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  const diff = (dayOfWeek - d.getDay() + 7) % 7 || 7
  d.setDate(d.getDate() + diff)
  d.setHours(hour, minute, 0, 0)
  return d
}

async function ensureDefaultEvents() {
  const count = await prisma.calendarEvent.count()
  if (count > 0) return
  await prisma.calendarEvent.createMany({
    data: [
      { title: 'Çocuk Tiyatro Atölyesi', type: 'education', date: nextWeekday(1, 17, 30), startTime: '17:30', active: true },
      { title: 'Yetişkin Oyunculuk', type: 'education', date: nextWeekday(2, 19, 30), startTime: '19:30', active: true },
      { title: 'Fiyonk — Oyun', type: 'play', date: nextWeekday(6, 20, 0), startTime: '20:00', active: true },
      { title: 'Genç Grup Provası', type: 'education', date: nextWeekday(0, 13, 0), startTime: '13:00', active: true },
    ],
  })
}

export async function GET(request: NextRequest) {
  const admin = request.nextUrl.searchParams.get('admin') === 'true'
  await ensureDefaultEvents()
  const events = await prisma.calendarEvent.findMany({
    where: admin ? {} : { active: true, date: { gte: new Date(new Date().setHours(0,0,0,0)) } },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    take: admin ? 200 : 20,
  })
  return NextResponse.json(events)
}

async function authorized(){ return Boolean(await getServerSession(authOptions)) }

export async function POST(request: NextRequest) {
  if (!await authorized()) return NextResponse.json({error:'Unauthorized'},{status:401})
  const body = await request.json()
  const event = await prisma.calendarEvent.create({data:{...body,date:new Date(body.date)}})
  return NextResponse.json(event)
}

export async function PUT(request: NextRequest) {
  if (!await authorized()) return NextResponse.json({error:'Unauthorized'},{status:401})
  const {id,...body}=await request.json()
  const event=await prisma.calendarEvent.update({where:{id},data:{...body,...(body.date&&{date:new Date(body.date)})}})
  return NextResponse.json(event)
}

export async function DELETE(request: NextRequest) {
  if (!await authorized()) return NextResponse.json({error:'Unauthorized'},{status:401})
  await prisma.calendarEvent.delete({where:{id:request.nextUrl.searchParams.get('id')||''}})
  return NextResponse.json({ok:true})
}
