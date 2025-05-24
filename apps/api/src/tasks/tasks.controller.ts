import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permission.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User as AuthUser } from '../common/types/user.interface';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { TaskMetricsDto } from './dto/task-metrics.dto';

@Controller('tasks')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Obtener métricas de tareas del usuario actual' })
  @ApiResponse({
    status: 200,
    description: 'Métricas obtenidas exitosamente',
    type: TaskMetricsDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @RequirePermissions(Permission.TASK_READ_OWN_LIST)
  getMetrics(@CurrentUser() user: AuthUser) {
    console.log('Fetching metrics for user:', user.id);
    return this.tasksService.getMetrics(user.id);
  }

  @Get('metrics/admin')
  @ApiOperation({ summary: 'Obtener métricas de todas las tareas (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Métricas obtenidas exitosamente',
    type: TaskMetricsDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido' })
  @RequirePermissions(Permission.TASK_READ_ANY_LIST)
  getMetricsAdmin() {
    return this.tasksService.getMetricsAdmin();
  }

  @Post()
  @ApiBody({ type: CreateTaskDto })
  @ApiOperation({ summary: 'Crear una nueva tarea' })
  @ApiResponse({ status: 201, description: 'Tarea creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @RequirePermissions(Permission.TASK_CREATE)
  create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: AuthUser) {
    return this.tasksService.create(createTaskDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las tareas del usuario actual' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tareas obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @RequirePermissions(Permission.TASK_READ_OWN_LIST)
  findAllOwn(@CurrentUser() user: AuthUser) {
    console.log('Fetching all tasks for admin');
    console.log('User ID:', user.id);
    return this.tasksService.findAllByOwner(user.id);
  }

  @Get('all')
  @ApiOperation({ summary: 'Obtener todas las tareas (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tareas obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido' })
  @RequirePermissions(Permission.TASK_READ_ANY_LIST)
  findAllAdmin() {
    return this.tasksService.findAllAdmin();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una tarea específica del usuario actual',
  })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({ status: 200, description: 'Tarea obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  @RequirePermissions(Permission.TASK_READ_OWN_DETAIL)
  findOneOwn(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tasksService.findOneByOwner(id, user.id);
  }

  @Get('admin/:id')
  @ApiOperation({ summary: 'Obtener cualquier tarea (admin)' })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({ status: 200, description: 'Tarea obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  @RequirePermissions(Permission.TASK_READ_ANY_DETAIL)
  findOneAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findOneAdmin(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una tarea del usuario actual' })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ status: 200, description: 'Tarea actualizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  @RequirePermissions(Permission.TASK_UPDATE_OWN)
  updateOwn(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tasksService.updateByOwner(id, updateTaskDto, user.id);
  }

  @Patch('admin/:id')
  @ApiOperation({ summary: 'Actualizar cualquier tarea (admin)' })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ status: 200, description: 'Tarea actualizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  @RequirePermissions(Permission.TASK_UPDATE_ANY)
  updateAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.updateAdmin(id, updateTaskDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una tarea del usuario actual' })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({ status: 200, description: 'Tarea eliminada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  @RequirePermissions(Permission.TASK_DELETE_OWN)
  removeOwn(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tasksService.removeByOwner(id, user.id);
  }

  @Delete('admin/:id')
  @ApiOperation({ summary: 'Eliminar cualquier tarea (admin)' })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({ status: 200, description: 'Tarea eliminada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  @RequirePermissions(Permission.TASK_DELETE_ANY)
  removeAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.removeAdmin(id);
  }
}
