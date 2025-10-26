// tuning/tuning.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
    HttpCode,
    HttpStatus,
    UseGuards,
    Request,
} from '@nestjs/common';
import { TuningService } from './tuning.service';
import {
    CreateTuningGroupDto,
    UpdateTuningGroupDto,
    CreateTuningPartDto,
    UpdateTuningPartDto,
} from './tuning.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cars/:carId/tuning')
@UseGuards(JwtAuthGuard)
export class TuningController {
    constructor(private readonly tuningService: TuningService) { }

    // ========== TuningGroup Routes ==========

    @Post('groups')
    @HttpCode(HttpStatus.CREATED)
    async createGroup(
        @Request() req,
        @Param('carId') carId: string,
        @Body() dto: CreateTuningGroupDto,
    ) {
        return this.tuningService.createGroup(carId, req.user.userId, dto);
    }

    @Get('groups')
    async findAllGroups(@Request() req, @Param('carId') carId: string) {
        return this.tuningService.findAllGroups(carId, req.user.userId);
    }
    @Get('groups/:groupId')
    async findOneGroup(
        @Request() req,
        @Param('carId') carId: string,
        @Param('groupId') groupId: string,
    ) {
        return this.tuningService.findOneGroup(groupId, carId, req.user.userId);
    }

    @Patch('groups/:groupId')
    async updateGroup(
        @Request() req,
        @Param('carId') carId: string,
        @Param('groupId') groupId: string,
        @Body() dto: UpdateTuningGroupDto,
    ) {
        return this.tuningService.updateGroup(groupId, carId, req.user.userId, dto);
    }

    @Delete('groups/:groupId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteGroup(
        @Request() req,
        @Param('carId') carId: string,
        @Param('groupId') groupId: string,
    ) {
        await this.tuningService.deleteGroup(groupId, carId, req.user.userId);
    }

    // ========== TuningPart Routes ==========

    @Post('parts')
    @HttpCode(HttpStatus.CREATED)
    async createPart(
        @Request() req,
        @Param('carId') carId: string,
        @Body() dto: CreateTuningPartDto,
    ) {
        return this.tuningService.createPart(carId, req.user.userId, dto);
    }

    @Get('parts')
    async findAllParts(@Request() req, @Param('carId') carId: string) {
        return this.tuningService.findAllParts(carId, req.user.userId);
    }

    @Get('groups/:groupId/parts')
    async findPartsByGroup(
        @Request() req,
        @Param('carId') carId: string,
        @Param('groupId') groupId: string,
    ) {
        return this.tuningService.findPartsByGroup(groupId, carId, req.user.userId);
    }

    @Get('parts/:partId')
    async findOnePart(
        @Request() req,
        @Param('carId') carId: string,
        @Param('partId') partId: string,
    ) {
        return this.tuningService.findOnePart(partId, carId, req.user.userId);
    }

    @Patch('parts/:partId')
    async updatePart(
        @Request() req,
        @Param('carId') carId: string,
        @Param('partId') partId: string,
        @Body() dto: UpdateTuningPartDto,
    ) {
        return this.tuningService.updatePart(partId, carId, req.user.userId, dto);
    }

    @Delete('parts/:partId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deletePart(
        @Request() req,
        @Param('carId') carId: string,
        @Param('partId') partId: string,
    ) {
        await this.tuningService.deletePart(partId, carId, req.user.userId);
    }
}