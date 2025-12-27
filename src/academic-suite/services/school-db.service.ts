import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSchoolDto, UpdateSchoolDto } from '../dto/create-school.dto';

@Injectable()
export class SchoolDbService {
  private readonly logger = new Logger(SchoolDbService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSchoolDto & { logo?: string }) {
    const school = await this.prisma.school.create({
      data: {
        name: data.name,
        schoolId: `SCH-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        url: data.url,
        address: data.address,
        longitude: data.longitude,
        latitude: data.latitude,
        principalName: data.principalName,
        principalEmail: data.principalEmail,
        principalPhone: data.principalPhone,
        phoneNumber: data.phoneNumber,
        email: data.email,
        customerId: data.customerId,
        isActive: data.isActive ?? true,
        logo: data.logo,
      },
    });
    return school;
  }

  async findAll(page: number = 1, pageSize: number = 10, customerId?: number) {
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (customerId) where.customerId = customerId;
    const [data, totalItems] = await Promise.all([
      this.prisma.school.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.school.count({ where }),
    ]);
    return {
      data,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  }

  async findById(id: string) {
    return this.prisma.school.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateSchoolDto & { logo?: string }) {
    const updated = await this.prisma.school.update({
      where: { id },
      data: { ...data },
    });
    return updated;
  }

  async delete(id: string) {
    return this.prisma.school.delete({ where: { id } });
  }
}
