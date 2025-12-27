import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStudentDto, UpdateStudentDto } from '../dto/create-student.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StudentDbService {
  private readonly logger = new Logger(StudentDbService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateStudentDto) {
    this.logger.log(`Creating new student: ${data.name}`);
    const student = await this.prisma.student.create({
      data: {
        id: uuidv4(),
        name: data.name,
        admissionNumber: data.admissionNumber,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        status: data.status ?? 'Active',
        specialNeeds: data.specialNeeds ?? [],
        medicalInfo: data.medicalInfo,
        rfidTagId: data.rfidTagId,
        photo: data.photo,
        isActive: data.isActive ?? true,
        schoolId: data.schoolId,
        parentId: data.parentId,
      },
      include: {
        school: { select: { id: true, name: true } },
        parent: { select: { id: true, name: true, parentType: true } },
      },
    });
    return student;
  }

  async findAll(page = 1, pageSize = 10, schoolId?: string, parentId?: string) {
    this.logger.debug(`Listing students page=${page} size=${pageSize} schoolId=${schoolId} parentId=${parentId}`);
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (schoolId) where.schoolId = schoolId;
    if (parentId) where.parentId = parentId;

    const [students, totalItems] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          school: { select: { id: true, name: true } },
          parent: { select: { id: true, name: true, parentType: true } },
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / pageSize);
    return { data: students, pagination: { page, pageSize, totalItems, totalPages } };
  }

  async findById(id: string) {
    return this.prisma.student.findUnique({
      where: { id },
      include: {
        school: { select: { id: true, name: true } },
        parent: { select: { id: true, name: true, parentType: true } },
      },
    });
  }

  async update(id: string, data: UpdateStudentDto) {
    const updateData: any = {};
    
    // Only include fields that are provided (not undefined)
    if (data.name !== undefined) updateData.name = data.name;
    if (data.admissionNumber !== undefined) updateData.admissionNumber = data.admissionNumber;
    if (data.dateOfBirth !== undefined) updateData.dateOfBirth = data.dateOfBirth;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.specialNeeds !== undefined) updateData.specialNeeds = data.specialNeeds;
    if (data.medicalInfo !== undefined) updateData.medicalInfo = data.medicalInfo;
    if (data.rfidTagId !== undefined) {
      updateData.rfidTagId = data.rfidTagId === '' || data.rfidTagId === null ? null : data.rfidTagId;
    }
    if (data.photo !== undefined) updateData.photo = data.photo;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.schoolId !== undefined) updateData.schoolId = data.schoolId;
    if (data.parentId !== undefined) updateData.parentId = data.parentId;

    const updated = await this.prisma.student.update({
      where: { id },
      data: updateData,
      include: {
        school: { select: { id: true, name: true } },
        parent: { select: { id: true, name: true, parentType: true } },
      },
    });
    return updated;
  }

  async delete(id: string) {
    return this.prisma.student.delete({ where: { id } });
  }

  async getStatistics() {
    const [total, active, inactive] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.student.count({ where: { isActive: true } }),
      this.prisma.student.count({ where: { isActive: false } }),
    ]);
    return { total, active, inactive };
  }

  async findByRfidTag(rfidTagId: string) {
    return this.prisma.student.findFirst({
      where: {
        rfidTagId,
        isActive: true,
      },
      include: {
        school: { select: { id: true, name: true } },
        parent: { select: { id: true, name: true, parentType: true } },
      },
    });
  }
}
