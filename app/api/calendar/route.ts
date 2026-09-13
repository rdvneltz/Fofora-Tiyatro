import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const admin = request.nextUrl.searchParams.get('admin') === 'true'
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
