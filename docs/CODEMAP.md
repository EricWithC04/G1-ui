# CODEMAP — índice del código NovaTech ERP

Referencia rápida: **qué hace cada archivo**. Los comentarios `/** ... */` en el código amplían detalle.

## Backend (`com.novatech.store`)

| Archivo | Qué hace |
|---------|----------|
| `BackendApplication.java` | Componente backend `BackendApplication` del paquete `BackendApplication.java`. |
| `config/BillingDemoSeeder.java` | Configuración Spring `BillingDemoSeeder`: beans, seguridad, seeders o ajustes de arranque. |
| `config/ConfigSeeder.java` | Configuración Spring `ConfigSeeder`: beans, seguridad, seeders o ajustes de arranque. |
| `config/CrmDemoSeeder.java` | Configuración Spring `CrmDemoSeeder`: beans, seguridad, seeders o ajustes de arranque. |
| `config/FacturacionConfig.java` | Reglas de negocio configurables para facturación desde presupuesto. |
| `config/ListaPrecioSeeder.java` | Configuración Spring `ListaPrecioSeeder`: beans, seguridad, seeders o ajustes de arranque. |
| `config/package-info.java` | Beans Spring, seeders demo, CORS, plantillas y seguridad. |
| `config/PasswordConfig.java` | Configuración Spring `PasswordConfig`: beans, seguridad, seeders o ajustes de arranque. |
| `config/PlantillaTemplates.java` | — |
| `config/SecurityConfig.java` | Configuración Spring `SecurityConfig`: beans, seguridad, seeders o ajustes de arranque. |
| `controller/AdminController.java` | Controlador REST `AdminController`: expone endpoints HTTP JSON para Admin. Ruta base en `@RequestMapping` de la clase. |
| `controller/AuditoriaController.java` | Controlador REST `AuditoriaController`: expone endpoints HTTP JSON para Auditoria. Ruta base en `@RequestMapping` de la clase. |
| `controller/AuthController.java` | Controlador REST `AuthController`: expone endpoints HTTP JSON para Auth. Ruta base en `@RequestMapping` de la clase. |
| `controller/CampanaController.java` | Controlador REST `CampanaController`: expone endpoints HTTP JSON para Campana. Ruta base en `@RequestMapping` de la clase. |
| `controller/CarritoController.java` | Controlador REST `CarritoController`: expone endpoints HTTP JSON para Carrito. Ruta base en `@RequestMapping` de la clase. |
| `controller/CatalogoConfigController.java` | Controlador REST `CatalogoConfigController`: expone endpoints HTTP JSON para CatalogoConfig. Ruta base en `@RequestMapping` de la clase. |
| `controller/CategoriaController.java` | Controlador REST `CategoriaController`: expone endpoints HTTP JSON para Categoria. Ruta base en `@RequestMapping` de la clase. |
| `controller/ClientePortalController.java` | Controlador REST `ClientePortalController`: expone endpoints HTTP JSON para ClientePortal. Ruta base en `@RequestMapping` de la clase. |
| `controller/ConfiguracionController.java` | Controlador REST `ConfiguracionController`: expone endpoints HTTP JSON para Configuracion. Ruta base en `@RequestMapping` de la clase. |
| `controller/ContabilidadConfigController.java` | Controlador REST `ContabilidadConfigController`: expone endpoints HTTP JSON para ContabilidadConfig. Ruta base en `@RequestMapping` de la clase. |
| `controller/ConversacionController.java` | Controlador REST `ConversacionController`: expone endpoints HTTP JSON para Conversacion. Ruta base en `@RequestMapping` de la clase. |
| `controller/CrmController.java` | Controlador REST `CrmController`: expone endpoints HTTP JSON para Crm. Ruta base en `@RequestMapping` de la clase. |
| `controller/CuotaController.java` | Controlador REST `CuotaController`: expone endpoints HTTP JSON para Cuota. Ruta base en `@RequestMapping` de la clase. |
| `controller/DashboardController.java` | Controlador REST `DashboardController`: expone endpoints HTTP JSON para Dashboard. Ruta base en `@RequestMapping` de la clase. |
| `controller/DetalleCarritoController.java` | Controlador REST `DetalleCarritoController`: expone endpoints HTTP JSON para DetalleCarrito. Ruta base en `@RequestMapping` de la clase. |
| `controller/DetallePedidoController.java` | Controlador REST `DetallePedidoController`: expone endpoints HTTP JSON para DetallePedido. Ruta base en `@RequestMapping` de la clase. |
| `controller/EmisorController.java` | Controlador REST `EmisorController`: expone endpoints HTTP JSON para Emisor. Ruta base en `@RequestMapping` de la clase. |
| `controller/EnvioController.java` | Controlador REST `EnvioController`: expone endpoints HTTP JSON para Envio. Ruta base en `@RequestMapping` de la clase. |
| `controller/FacturaController.java` | Controlador REST `FacturaController`: expone endpoints HTTP JSON para Factura. Ruta base en `@RequestMapping` de la clase. |
| `controller/HealthController.java` | Health check compatible con monitoreo y load balancers. |
| `controller/IntegracionCanalController.java` | Controlador REST `IntegracionCanalController`: expone endpoints HTTP JSON para IntegracionCanal. Ruta base en `@RequestMapping` de la clase. |
| `controller/InteraccionCrmController.java` | Controlador REST `InteraccionCrmController`: expone endpoints HTTP JSON para InteraccionCrm. Ruta base en `@RequestMapping` de la clase. |
| `controller/ListaPrecioController.java` | Controlador REST `ListaPrecioController`: expone endpoints HTTP JSON para ListaPrecio. Ruta base en `@RequestMapping` de la clase. |
| `controller/OrdenCompraController.java` | Controlador REST `OrdenCompraController`: expone endpoints HTTP JSON para OrdenCompra. Ruta base en `@RequestMapping` de la clase. |
| `controller/OrdenVentaController.java` | Controlador REST `OrdenVentaController`: expone endpoints HTTP JSON para OrdenVenta. Ruta base en `@RequestMapping` de la clase. |
| `controller/package-info.java` | Capa REST: recibe HTTP, valida entrada y delega en services. Un controller por dominio (productos, pedidos, facturas…). |
| `controller/PagoController.java` | Controlador REST `PagoController`: expone endpoints HTTP JSON para Pago. Ruta base en `@RequestMapping` de la clase. |
| `controller/PedidoController.java` | Controlador REST `PedidoController`: expone endpoints HTTP JSON para Pedido. Ruta base en `@RequestMapping` de la clase. |
| `controller/PerfilClienteController.java` | Controlador REST `PerfilClienteController`: expone endpoints HTTP JSON para PerfilCliente. Ruta base en `@RequestMapping` de la clase. |
| `controller/PingController.java` | Controlador REST `PingController`: expone endpoints HTTP JSON para Ping. Ruta base en `@RequestMapping` de la clase. |
| `controller/PlanCuotasController.java` | Controlador REST `PlanCuotasController`: expone endpoints HTTP JSON para PlanCuotas. Ruta base en `@RequestMapping` de la clase. |
| `controller/PlantillaController.java` | Controlador REST `PlantillaController`: expone endpoints HTTP JSON para Plantilla. Ruta base en `@RequestMapping` de la clase. |
| `controller/PresupuestoController.java` | Controlador REST `PresupuestoController`: expone endpoints HTTP JSON para Presupuesto. Ruta base en `@RequestMapping` de la clase. |
| `controller/ProductoController.java` | Controlador REST `ProductoController`: expone endpoints HTTP JSON para Producto. Ruta base en `@RequestMapping` de la clase. |
| `controller/PromocionController.java` | Controlador REST `PromocionController`: expone endpoints HTTP JSON para Promocion. Ruta base en `@RequestMapping` de la clase. |
| `controller/RbacController.java` | Controlador REST `RbacController`: expone endpoints HTTP JSON para Rbac. Ruta base en `@RequestMapping` de la clase. |
| `controller/RemitoController.java` | Controlador REST `RemitoController`: expone endpoints HTTP JSON para Remito. Ruta base en `@RequestMapping` de la clase. |
| `controller/ResenaController.java` | Controlador REST `ResenaController`: expone endpoints HTTP JSON para Resena. Ruta base en `@RequestMapping` de la clase. |
| `controller/UsuarioController.java` | Controlador REST `UsuarioController`: expone endpoints HTTP JSON para Usuario. Ruta base en `@RequestMapping` de la clase. |
| `dto/ActualizarPerfilClienteRequest.java` | DTO `ActualizarPerfilClienteRequest`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/ActualizarPerfilRequest.java` | DTO `ActualizarPerfilRequest`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/AdminBuscarItemDto.java` | DTO `AdminBuscarItemDto`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/AdminBuscarResponse.java` | DTO `AdminBuscarResponse`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/AdminNotificacionDto.java` | DTO `AdminNotificacionDto`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/ConfirmarOrdenLineaRequest.java` | DTO `ConfirmarOrdenLineaRequest`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/ConfirmarOrdenRequest.java` | DTO `ConfirmarOrdenRequest`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/ConfirmarOrdenResponse.java` | DTO `ConfirmarOrdenResponse`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/ConversacionResumenResponse.java` | — |
| `dto/CrearDevolucionRequest.java` | DTO `CrearDevolucionRequest`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/CrearTicketClienteRequest.java` | DTO `CrearTicketClienteRequest`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/CrmResumenResponse.java` | DTO `CrmResumenResponse`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/CuotaClienteItemDto.java` | DTO `CuotaClienteItemDto`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/CuotaResumenDto.java` | DTO `CuotaResumenDto`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/DashboardKpiResponse.java` | DTO `DashboardKpiResponse`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/EnviarMensajeTicketRequest.java` | DTO `EnviarMensajeTicketRequest`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/EnvioDetalleResponse.java` | DTO `EnvioDetalleResponse`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/EstadoCantidadDto.java` | DTO `EstadoCantidadDto`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/FacturaRecienteDto.java` | DTO `FacturaRecienteDto`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/GenerarFacturaRequest.java` | — |
| `dto/GenerarOrdenCompraRequest.java` | DTO `GenerarOrdenCompraRequest`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/IntegracionCanalResponse.java` | DTO `IntegracionCanalResponse`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/LineaComprobanteDto.java` | — |
| `dto/ListaPrecioDetalleRequest.java` | DTO `ListaPrecioDetalleRequest`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/ListaPrecioUpdateRequest.java` | DTO `ListaPrecioUpdateRequest`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/LoginRequest.java` | DTO `LoginRequest`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/package-info.java` | Objetos de entrada/salida desacoplados de entidades. |
| `dto/PedidoDetalleResponse.java` | DTO `PedidoDetalleResponse`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/PedidoRecienteDto.java` | DTO `PedidoRecienteDto`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/PlantillaRenderResponse.java` | DTO `PlantillaRenderResponse`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/PrecioResueltoDto.java` | DTO `PrecioResueltoDto`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/PrestamoClienteDto.java` | — |
| `dto/PresupuestoRequest.java` | DTO `PresupuestoRequest`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/RegistroRequest.java` | DTO `RegistroRequest`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/RemitoRequest.java` | DTO `RemitoRequest`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `dto/SensitiveDataMasker.java` | — |
| `dto/UsuarioResponse.java` | DTO `UsuarioResponse`: objeto de transferencia (entrada/salida) sin mapeo directo 1:1 a tabla. |
| `entity/AlicuotaIva.java` | Entidad JPA `AlicuotaIva`: tabla y relaciones ORM; se serializa a JSON en respuestas API. |
| `entity/Campana.java` | — |
| `entity/Carrito.java` | Entidad JPA `Carrito`: tabla y relaciones ORM; se serializa a JSON en respuestas API. |
| `entity/CatalogoMaestro.java` | — |
| `entity/Categoria.java` | Entidad JPA `Categoria`: tabla y relaciones ORM; se serializa a JSON en respuestas API. |
| `entity/ConfiguracionSistema.java` | Entidad JPA `ConfiguracionSistema`: tabla y relaciones ORM; se serializa a JSON en respuestas API. |
| `entity/Conversacion.java` | — |
| `entity/Cuota.java` | — |
| `entity/DetalleCarrito.java` | Entidad JPA `DetalleCarrito`: tabla y relaciones ORM; se serializa a JSON en respuestas API. |
| `entity/DetalleFactura.java` | Entidad JPA `DetalleFactura`: tabla y relaciones ORM; se serializa a JSON en respuestas API. |
| `entity/DetalleOrdenCompra.java` | Entidad JPA `DetalleOrdenCompra`: tabla y relaciones ORM; se serializa a JSON en respuestas API. |
| `entity/DetallePedido.java` | Entidad JPA `DetallePedido`: tabla y relaciones ORM; se serializa a JSON en respuestas API. |
| `entity/DetallePresupuesto.java` | Entidad JPA `DetallePresupuesto`: tabla y relaciones ORM; se serializa a JSON en respuestas API. |
| `entity/DetalleRemito.java` | Entidad JPA `DetalleRemito`: tabla y relaciones ORM; se serializa a JSON en respuestas API. |
| `entity/Emisor.java` | — |
| `entity/Envio.java` | Entidad JPA `Envio`: tabla y relaciones ORM; se serializa a JSON en respuestas API. |
| `entity/Factura.java` | Entidad JPA `Factura`: tabla y relaciones ORM; se serializa a JSON en respuestas API. |
| `entity/IntegracionCanal.java` | — |
| `entity/InteraccionCrm.java` | — |
| `entity/ListaPrecio.java` | Entidad JPA `ListaPrecio`: tabla y relaciones ORM; se serializa a JSON en respuestas API. |
| `entity/ListaPrecioDetalle.java` | Entidad JPA `ListaPrecioDetalle`: tabla y relaciones ORM; se serializa a JSON en respuestas API. |
| `entity/LogSistema.java` | — |
| `entity/MensajeCliente.java` | — |
| `entity/MensajeConversacion.java` | — |
| `entity/OrdenCompra.java` | — |
| `entity/package-info.java` | Modelo relacional JPA + serialización JSON (cuidado con @JsonIgnore en ciclos). |
| `entity/Pago.java` | Entidad JPA `Pago`: tabla y relaciones ORM; se serializa a JSON en respuestas API. |
| `entity/Pedido.java` | Entidad JPA `Pedido`: tabla y relaciones ORM; se serializa a JSON en respuestas API. |
| `entity/PerfilCliente.java` | Entidad JPA `PerfilCliente`: tabla y relaciones ORM; se serializa a JSON en respuestas API. |
| `entity/Permiso.java` | Entidad JPA `Permiso`: tabla y relaciones ORM; se serializa a JSON en respuestas API. |
| `entity/PlanCuotas.java` | Entidad JPA `PlanCuotas`: tabla y relaciones ORM; se serializa a JSON en respuestas API. |
| `entity/PlantillaImpresion.java` | — |
| `entity/Presupuesto.java` | Entidad JPA `Presupuesto`: tabla y relaciones ORM; se serializa a JSON en respuestas API. |
| `entity/Producto.java` | Entidad JPA `Producto`: tabla y relaciones ORM; se serializa a JSON en respuestas API. |
| `entity/Promocion.java` | Entidad JPA `Promocion`: tabla y relaciones ORM; se serializa a JSON en respuestas API. |
| `entity/RegistroAuditoria.java` | Entidad JPA `RegistroAuditoria`: tabla y relaciones ORM; se serializa a JSON en respuestas API. |
| `entity/Remito.java` | Entidad JPA `Remito`: tabla y relaciones ORM; se serializa a JSON en respuestas API. |
| `entity/Resena.java` | Entidad JPA `Resena`: tabla y relaciones ORM; se serializa a JSON en respuestas API. |
| `entity/RolPermiso.java` | Entidad JPA `RolPermiso`: tabla y relaciones ORM; se serializa a JSON en respuestas API. |
| `entity/RolRbac.java` | — |
| `entity/SolicitudDevolucion.java` | Entidad JPA `SolicitudDevolucion`: tabla y relaciones ORM; se serializa a JSON en respuestas API. |
| `entity/Usuario.java` | Entidad JPA `Usuario`: tabla y relaciones ORM; se serializa a JSON en respuestas API. |
| `exception/AccesoDenegadoException.java` | Manejo de excepciones `AccesoDenegadoException`: respuestas HTTP uniformes ante errores. |
| `exception/GlobalExceptionHandler.java` | Manejo de excepciones `GlobalExceptionHandler`: respuestas HTTP uniformes ante errores. |
| `exception/package-info.java` | Errores HTTP uniformes (400/404/500). |
| `exception/ReglaNegocioException.java` | Manejo de excepciones `ReglaNegocioException`: respuestas HTTP uniformes ante errores. |
| `exception/ResourceNotFoundException.java` | Manejo de excepciones `ResourceNotFoundException`: respuestas HTTP uniformes ante errores. |
| `repository/AlicuotaIvaRepository.java` | Repositorio JPA `AlicuotaIvaRepository`: consultas y persistencia de entidad AlicuotaIva en MySQL. |
| `repository/CampanaRepository.java` | Repositorio JPA `CampanaRepository`: consultas y persistencia de entidad Campana en MySQL. |
| `repository/CarritoRepository.java` | Repositorio JPA `CarritoRepository`: consultas y persistencia de entidad Carrito en MySQL. |
| `repository/CatalogoMaestroRepository.java` | Repositorio JPA `CatalogoMaestroRepository`: consultas y persistencia de entidad CatalogoMaestro en MySQL. |
| `repository/CategoriaRepository.java` | Repositorio JPA `CategoriaRepository`: consultas y persistencia de entidad Categoria en MySQL. |
| `repository/ConfiguracionSistemaRepository.java` | Repositorio JPA `ConfiguracionSistemaRepository`: consultas y persistencia de entidad ConfiguracionSistema en MySQL. |
| `repository/ConversacionRepository.java` | Repositorio JPA `ConversacionRepository`: consultas y persistencia de entidad Conversacion en MySQL. |
| `repository/CuotaRepository.java` | Repositorio JPA `CuotaRepository`: consultas y persistencia de entidad Cuota en MySQL. |
| `repository/DetalleCarritoRepository.java` | Repositorio JPA `DetalleCarritoRepository`: consultas y persistencia de entidad DetalleCarrito en MySQL. |
| `repository/DetallePedidoRepository.java` | Repositorio JPA `DetallePedidoRepository`: consultas y persistencia de entidad DetallePedido en MySQL. |
| `repository/EmisorRepository.java` | Repositorio JPA `EmisorRepository`: consultas y persistencia de entidad Emisor en MySQL. |
| `repository/EnvioRepository.java` | Repositorio JPA `EnvioRepository`: consultas y persistencia de entidad Envio en MySQL. |
| `repository/FacturaRepository.java` | Repositorio JPA `FacturaRepository`: consultas y persistencia de entidad Factura en MySQL. |
| `repository/IntegracionCanalRepository.java` | Repositorio JPA `IntegracionCanalRepository`: consultas y persistencia de entidad IntegracionCanal en MySQL. |
| `repository/InteraccionCrmRepository.java` | Repositorio JPA `InteraccionCrmRepository`: consultas y persistencia de entidad InteraccionCrm en MySQL. |
| `repository/ListaPrecioDetalleRepository.java` | Repositorio JPA `ListaPrecioDetalleRepository`: consultas y persistencia de entidad ListaPrecioDetalle en MySQL. |
| `repository/ListaPrecioRepository.java` | Repositorio JPA `ListaPrecioRepository`: consultas y persistencia de entidad ListaPrecio en MySQL. |
| `repository/LogSistemaRepository.java` | Repositorio JPA `LogSistemaRepository`: consultas y persistencia de entidad LogSistema en MySQL. |
| `repository/MensajeClienteRepository.java` | Repositorio JPA `MensajeClienteRepository`: consultas y persistencia de entidad MensajeCliente en MySQL. |
| `repository/MensajeConversacionRepository.java` | Repositorio JPA `MensajeConversacionRepository`: consultas y persistencia de entidad MensajeConversacion en MySQL. |
| `repository/OrdenCompraRepository.java` | Repositorio JPA `OrdenCompraRepository`: consultas y persistencia de entidad OrdenCompra en MySQL. |
| `repository/package-info.java` | Capa de datos JPA: acceso a MySQL vía Spring Data. |
| `repository/PagoRepository.java` | Repositorio JPA `PagoRepository`: consultas y persistencia de entidad Pago en MySQL. |
| `repository/PedidoRepository.java` | Repositorio JPA `PedidoRepository`: consultas y persistencia de entidad Pedido en MySQL. |
| `repository/PerfilClienteRepository.java` | Repositorio JPA `PerfilClienteRepository`: consultas y persistencia de entidad PerfilCliente en MySQL. |
| `repository/PermisoRepository.java` | Repositorio JPA `PermisoRepository`: consultas y persistencia de entidad Permiso en MySQL. |
| `repository/PlanCuotasRepository.java` | Repositorio JPA `PlanCuotasRepository`: consultas y persistencia de entidad PlanCuotas en MySQL. |
| `repository/PlantillaImpresionRepository.java` | Repositorio JPA `PlantillaImpresionRepository`: consultas y persistencia de entidad PlantillaImpresion en MySQL. |
| `repository/PresupuestoRepository.java` | Repositorio JPA `PresupuestoRepository`: consultas y persistencia de entidad Presupuesto en MySQL. |
| `repository/ProductoRepository.java` | Repositorio JPA `ProductoRepository`: consultas y persistencia de entidad Producto en MySQL. |
| `repository/PromocionRepository.java` | Repositorio JPA `PromocionRepository`: consultas y persistencia de entidad Promocion en MySQL. |
| `repository/RegistroAuditoriaRepository.java` | Repositorio JPA `RegistroAuditoriaRepository`: consultas y persistencia de entidad RegistroAuditoria en MySQL. |
| `repository/RemitoRepository.java` | Repositorio JPA `RemitoRepository`: consultas y persistencia de entidad Remito en MySQL. |
| `repository/ResenaRepository.java` | Repositorio JPA `ResenaRepository`: consultas y persistencia de entidad Resena en MySQL. |
| `repository/RolPermisoRepository.java` | Repositorio JPA `RolPermisoRepository`: consultas y persistencia de entidad RolPermiso en MySQL. |
| `repository/RolRbacRepository.java` | Repositorio JPA `RolRbacRepository`: consultas y persistencia de entidad RolRbac en MySQL. |
| `repository/SolicitudDevolucionRepository.java` | Repositorio JPA `SolicitudDevolucionRepository`: consultas y persistencia de entidad SolicitudDevolucion en MySQL. |
| `repository/UsuarioRepository.java` | Repositorio JPA `UsuarioRepository`: consultas y persistencia de entidad Usuario en MySQL. |
| `scheduler/AutomatizacionScheduler.java` | Componente backend `AutomatizacionScheduler` del paquete `scheduler`. |
| `security/JwtAuthFilter.java` | Seguridad `JwtAuthFilter`: autenticación JWT, filtros o utilidades de rol/sesión. |
| `security/JwtService.java` | Seguridad `JwtService`: autenticación JWT, filtros o utilidades de rol/sesión. |
| `security/package-info.java` | JWT en cookie, filtros y utilidades de usuario autenticado. |
| `security/SecurityUtils.java` | — |
| `service/AdminService.java` | Servicio `AdminService`: reglas de negocio, transacciones y orquestación de Admin. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/AuditoriaService.java` | Servicio `AuditoriaService`: reglas de negocio, transacciones y orquestación de Auditoria. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/CampanaService.java` | Servicio `CampanaService`: reglas de negocio, transacciones y orquestación de Campana. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/CarritoService.java` | Servicio `CarritoService`: reglas de negocio, transacciones y orquestación de Carrito. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/CatalogoConfigService.java` | Servicio `CatalogoConfigService`: reglas de negocio, transacciones y orquestación de CatalogoConfig. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/CategoriaService.java` | Servicio `CategoriaService`: reglas de negocio, transacciones y orquestación de Categoria. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/ClienteMetricasService.java` | Servicio `ClienteMetricasService`: reglas de negocio, transacciones y orquestación de ClienteMetricas. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/ClientePortalService.java` | Servicio `ClientePortalService`: reglas de negocio, transacciones y orquestación de ClientePortal. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/CobranzaCrmService.java` | Servicio `CobranzaCrmService`: reglas de negocio, transacciones y orquestación de CobranzaCrm. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/ConfiguracionService.java` | Servicio `ConfiguracionService`: reglas de negocio, transacciones y orquestación de Configuracion. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/ContabilidadConfigService.java` | Servicio `ContabilidadConfigService`: reglas de negocio, transacciones y orquestación de ContabilidadConfig. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/ConversacionService.java` | Servicio `ConversacionService`: reglas de negocio, transacciones y orquestación de Conversacion. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/CrmMetricsService.java` | Servicio `CrmMetricsService`: reglas de negocio, transacciones y orquestación de CrmMetrics. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/CrmService.java` | Servicio `CrmService`: reglas de negocio, transacciones y orquestación de Crm. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/CuotaService.java` | Servicio `CuotaService`: reglas de negocio, transacciones y orquestación de Cuota. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/DashboardService.java` | Servicio `DashboardService`: reglas de negocio, transacciones y orquestación de Dashboard. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/DetalleCarritoService.java` | Servicio `DetalleCarritoService`: reglas de negocio, transacciones y orquestación de DetalleCarrito. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/DetallePedidoService.java` | Servicio `DetallePedidoService`: reglas de negocio, transacciones y orquestación de DetallePedido. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/EmisorService.java` | Servicio `EmisorService`: reglas de negocio, transacciones y orquestación de Emisor. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/EnvioService.java` | Servicio `EnvioService`: reglas de negocio, transacciones y orquestación de Envio. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/FacturaService.java` | Servicio `FacturaService`: reglas de negocio, transacciones y orquestación de Factura. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/IntegracionCanalService.java` | Servicio `IntegracionCanalService`: reglas de negocio, transacciones y orquestación de IntegracionCanal. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/InteraccionCrmService.java` | Servicio `InteraccionCrmService`: reglas de negocio, transacciones y orquestación de InteraccionCrm. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/ListaPrecioService.java` | Servicio `ListaPrecioService`: reglas de negocio, transacciones y orquestación de ListaPrecio. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/OrdenCompraService.java` | Servicio `OrdenCompraService`: reglas de negocio, transacciones y orquestación de OrdenCompra. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/OrdenVentaService.java` | Servicio `OrdenVentaService`: reglas de negocio, transacciones y orquestación de OrdenVenta. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/package-info.java` | Capa de negocio: transacciones, reglas, KPIs y orquestación entre repositorios. |
| `service/PagoService.java` | Servicio `PagoService`: reglas de negocio, transacciones y orquestación de Pago. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/PedidoService.java` | Servicio `PedidoService`: reglas de negocio, transacciones y orquestación de Pedido. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/PerfilClienteService.java` | Servicio `PerfilClienteService`: reglas de negocio, transacciones y orquestación de PerfilCliente. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/PlanCuotasService.java` | Servicio `PlanCuotasService`: reglas de negocio, transacciones y orquestación de PlanCuotas. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/PlantillaRenderService.java` | Servicio `PlantillaRenderService`: reglas de negocio, transacciones y orquestación de PlantillaRender. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/PlantillaService.java` | Servicio `PlantillaService`: reglas de negocio, transacciones y orquestación de Plantilla. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/PresupuestoService.java` | Servicio `PresupuestoService`: reglas de negocio, transacciones y orquestación de Presupuesto. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/ProductoService.java` | Servicio `ProductoService`: reglas de negocio, transacciones y orquestación de Producto. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/PromocionService.java` | Servicio `PromocionService`: reglas de negocio, transacciones y orquestación de Promocion. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/RbacService.java` | Servicio `RbacService`: reglas de negocio, transacciones y orquestación de Rbac. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/RemitoService.java` | Servicio `RemitoService`: reglas de negocio, transacciones y orquestación de Remito. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/ResenaService.java` | Servicio `ResenaService`: reglas de negocio, transacciones y orquestación de Resena. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/SolicitudDevolucionService.java` | Servicio `SolicitudDevolucionService`: reglas de negocio, transacciones y orquestación de SolicitudDevolucion. Los controllers delegan aquí; no accede HTTP directamente. |
| `service/UsuarioService.java` | Servicio `UsuarioService`: reglas de negocio, transacciones y orquestación de Usuario. Los controllers delegan aquí; no accede HTTP directamente. |
| `util/ComprobanteCalculoUtil.java` | — |
| `util/FechaCobranzaUtil.java` | — |
| `util/ListaPrecioCodigo.java` | — |
| `util/NumeroALetrasUtil.java` | — |
| `util/package-info.java` | Helpers estáticos compartidos. |
| `util/PagoUtil.java` | — |
| `util/PrecioListaUtil.java` | Precio efectivo: precio fijo unitario, o base menos descuento unitario, o base menos descuento global. |
| `util/StockInventarioUtil.java` | — |
| `util/UsuarioRolUtil.java` | Empleados: SUPERADMIN, ADMIN, GERENTE, VENDEDOR y cualquier rol con acceso al panel |
| `validation/NombreCategoriaValidator.java` | Valida que el nombre de una categoria sea coherente (ej: "Notebooks", "Sillas Gamer"). |
| `validation/package-info.java` | Patrones Bean Validation reutilizables. |
| `validation/ValidationPatterns.java` | — |

## Frontend (`src/app`)

| Archivo | Qué hace |
|---------|----------|
| `app.config.ts` | Bootstrap Angular: router, HttpClient, interceptors e inicializador de sesión. |
| `app.routes.ts` | Definición de rutas: tienda, login, panel admin y guards por URL. |
| `app.ts` | Módulo frontend `app` (app.ts). |
| `components/admin-pagination/admin-pagination.ts` | Componente reutilizable `admin-pagination`: UI compartida entre varias pantallas. |
| `components/admin-search/admin-search.ts` | Componente reutilizable `admin-search`: UI compartida entre varias pantallas. |
| `components/config-page-shell/config-page-shell.ts` | Componente reutilizable `config-page-shell`: UI compartida entre varias pantallas. |
| `components/header/header.ts` | Componente reutilizable `header`: UI compartida entre varias pantallas. |
| `components/header-crm-inbox/header-crm-inbox.ts` | Componente reutilizable `header-crm-inbox`: UI compartida entre varias pantallas. |
| `components/header-global-search/header-global-search.ts` | Componente reutilizable `header-global-search`: UI compartida entre varias pantallas. |
| `components/header-notifications/header-notifications.ts` | Componente reutilizable `header-notifications`: UI compartida entre varias pantallas. |
| `components/product-card/product-card.ts` | Componente reutilizable `product-card`: UI compartida entre varias pantallas. |
| `components/sidebar/sidebar/sidebar.ts` | Componente reutilizable `sidebar`: UI compartida entre varias pantallas. |
| `components/sidebar/sidebar.ts` | Navegación alineada al hub de Configuración: un link por área, |
| `components/store-header/store-header.ts` | Componente reutilizable `store-header`: UI compartida entre varias pantallas. |
| `components/toast-container/toast-container.ts` | Componente reutilizable `toast-container`: UI compartida entre varias pantallas. |
| `config/config-rbac.ts` | — |
| `data/landing-pages.ts` | Módulo frontend `landing-pages` (data). |
| `guards/admin.guard.ts` | Guard de ruta `admin.guard`: decide si el router permite entrar según sesión/rol/permiso. |
| `guards/auth.guard.ts` | Guard de ruta `auth.guard`: decide si el router permite entrar según sesión/rol/permiso. |
| `guards/cliente.guard.ts` | — |
| `guards/guest.guard.ts` | — |
| `guards/permiso.guard.ts` | Guard de ruta `permiso.guard`: decide si el router permite entrar según sesión/rol/permiso. |
| `interceptors/credentials.interceptor.ts` | — |
| `interceptors/http-error.interceptor.ts` | Interceptor HTTP `http-error.interceptor`: modifica requests/responses globales (cookies, errores). |
| `layouts/admin-layout/admin-layout.ts` | Layout `admin-layout`: marco visual (header/sidebar/outlet) de una zona del sitio. |
| `layouts/crm-layout/crm-layout.ts` | Layout `crm-layout`: marco visual (header/sidebar/outlet) de una zona del sitio. |
| `layouts/storefront-layout/storefront-layout.ts` | Layout `storefront-layout`: marco visual (header/sidebar/outlet) de una zona del sitio. |
| `models/condiciones-iva.ts` | — |
| `models/listas-precio.ts` | — |
| `models/models.ts` | Modelos TypeScript: interfaces que reflejan entidades/DTOs del backend. |
| `models/product.model.ts` | Modelos TypeScript: interfaces que reflejan entidades/DTOs del backend. |
| `models/tipos-cliente.ts` | — |
| `pages/campanas/campanas.ts` | Página `campanas`: pantalla Angular (componente + template) del módulo campanas. |
| `pages/carrito-compra/carrito-compra.ts` | Página `carrito-compra`: pantalla Angular (componente + template) del módulo carrito-compra. |
| `pages/catalogo/catalogo.ts` | Página `catalogo`: pantalla Angular (componente + template) del módulo catalogo. |
| `pages/categoria-landing/categoria-landing.ts` | Página `categoria-landing`: pantalla Angular (componente + template) del módulo categoria-landing. |
| `pages/checkout/checkout.ts` | Página `checkout`: pantalla Angular (componente + template) del módulo checkout. |
| `pages/configuracion/configuracion.ts` | Página `configuracion`: pantalla Angular (componente + template) del módulo configuracion. |
| `pages/configuracion/sections/config-auditoria/config-auditoria.ts` | Página `config-auditoria`: pantalla Angular (componente + template) del módulo configuracion. |
| `pages/configuracion/sections/config-catalogos/config-catalogos.ts` | Página `config-catalogos`: pantalla Angular (componente + template) del módulo configuracion. |
| `pages/configuracion/sections/config-contabilidad/config-contabilidad.ts` | Página `config-contabilidad`: pantalla Angular (componente + template) del módulo configuracion. |
| `pages/configuracion/sections/config-emisores/config-emisores.ts` | Página `config-emisores`: pantalla Angular (componente + template) del módulo configuracion. |
| `pages/configuracion/sections/config-integraciones/config-integraciones.ts` | Página `config-integraciones`: pantalla Angular (componente + template) del módulo configuracion. |
| `pages/configuracion/sections/config-logs/config-logs.ts` | Página `config-logs`: pantalla Angular (componente + template) del módulo configuracion. |
| `pages/configuracion/sections/config-notificaciones/config-notificaciones.ts` | Página `config-notificaciones`: pantalla Angular (componente + template) del módulo configuracion. |
| `pages/configuracion/sections/config-plantillas/config-plantillas.ts` | Página `config-plantillas`: pantalla Angular (componente + template) del módulo configuracion. |
| `pages/configuracion/sections/config-seguridad/config-seguridad.ts` | Página `config-seguridad`: pantalla Angular (componente + template) del módulo configuracion. |
| `pages/configuracion/sections/config-usuarios/config-usuarios.ts` | Página `config-usuarios`: pantalla Angular (componente + template) del módulo configuracion. |
| `pages/create-product/create-product.ts` | Página `create-product`: pantalla Angular (componente + template) del módulo create-product. |
| `pages/creditos/creditos.ts` | Página `creditos`: pantalla Angular (componente + template) del módulo creditos. |
| `pages/crm-bandeja/crm-bandeja.ts` | Página `crm-bandeja`: pantalla Angular (componente + template) del módulo crm-bandeja. |
| `pages/crm-cliente-ficha/crm-cliente-ficha.ts` | Página `crm-cliente-ficha`: pantalla Angular (componente + template) del módulo crm-cliente-ficha. |
| `pages/crm-cliente-nuevo/crm-cliente-nuevo.ts` | Página `crm-cliente-nuevo`: pantalla Angular (componente + template) del módulo crm-cliente-nuevo. |
| `pages/crm-clientes/crm-clientes.ts` | Página `crm-clientes`: pantalla Angular (componente + template) del módulo crm-clientes. |
| `pages/dashboard/dashboard.ts` | Página `dashboard`: pantalla Angular (componente + template) del módulo dashboard. |
| `pages/envios/envios.ts` | Página `envios`: pantalla Angular (componente + template) del módulo envios. |
| `pages/factura-nueva/factura-nueva.ts` | Página `factura-nueva`: pantalla Angular (componente + template) del módulo factura-nueva. |
| `pages/facturacion/facturacion.ts` | Página `facturacion`: pantalla Angular (componente + template) del módulo facturacion. |
| `pages/listas-precios/listas-precios.ts` | Página `listas-precios`: pantalla Angular (componente + template) del módulo listas-precios. |
| `pages/login/login.ts` | Página `login`: pantalla Angular (componente + template) del módulo login. |
| `pages/ordenes-compra/ordenes-compra.ts` | Página `ordenes-compra`: pantalla Angular (componente + template) del módulo ordenes-compra. |
| `pages/pagos/pagos.ts` | Página `pagos`: pantalla Angular (componente + template) del módulo pagos. |
| `pages/panel-cliente/panel-cliente.ts` | Página `panel-cliente`: pantalla Angular (componente + template) del módulo panel-cliente. |
| `pages/pedido-nuevo/pedido-nuevo.ts` | Página `pedido-nuevo`: pantalla Angular (componente + template) del módulo pedido-nuevo. |
| `pages/pedidos/pedidos.ts` | Página `pedidos`: pantalla Angular (componente + template) del módulo pedidos. |
| `pages/planes/planes.ts` | Página `planes`: pantalla Angular (componente + template) del módulo planes. |
| `pages/pos-mostrador/pos-mostrador.ts` | Página `pos-mostrador`: pantalla Angular (componente + template) del módulo pos-mostrador. |
| `pages/presupuesto-detalle/presupuesto-detalle.ts` | Página `presupuesto-detalle`: pantalla Angular (componente + template) del módulo presupuesto-detalle. |
| `pages/presupuesto-form/presupuesto-form.ts` | Página `presupuesto-form`: pantalla Angular (componente + template) del módulo presupuesto-form. |
| `pages/presupuestos/presupuestos.ts` | Página `presupuestos`: pantalla Angular (componente + template) del módulo presupuestos. |
| `pages/product-list/product-list.ts` | Página `product-list`: pantalla Angular (componente + template) del módulo product-list. |
| `pages/producto-detalle/producto-detalle.ts` | Página `producto-detalle`: pantalla Angular (componente + template) del módulo producto-detalle. |
| `pages/promo-landing/promo-landing.ts` | Página `promo-landing`: pantalla Angular (componente + template) del módulo promo-landing. |
| `pages/promociones/promociones.ts` | Página `promociones`: pantalla Angular (componente + template) del módulo promociones. |
| `pages/register/register.ts` | Página `register`: pantalla Angular (componente + template) del módulo register. |
| `pages/remito-detalle/remito-detalle.ts` | Página `remito-detalle`: pantalla Angular (componente + template) del módulo remito-detalle. |
| `pages/remitos/remitos.ts` | Página `remitos`: pantalla Angular (componente + template) del módulo remitos. |
| `pages/seguimiento-envio/seguimiento-envio.ts` | Página `seguimiento-envio`: pantalla Angular (componente + template) del módulo seguimiento-envio. |
| `services/admin.service.ts` | Servicio Angular `admin.service`: llama API `/ admin` y expone Observables al UI. |
| `services/api-base.ts` | Clase base HTTP CRUD: listar, obtener, crear, actualizar y eliminar por recurso REST. |
| `services/auth.service.ts` | Autenticación: login, registro, logout, restaurar sesión desde cookie HttpOnly. |
| `services/campana.service.ts` | Servicio Angular `campana.service`: llama API `/ campana` y expone Observables al UI. |
| `services/carrito.service.ts` | Servicio para hablar con el backend de carritos (/carritos). |
| `services/cart.service.ts` | Servicio Angular `cart.service`: llama API `/ cart` y expone Observables al UI. |
| `services/categoria.service.ts` | Servicio para hablar con el backend de categorias (/categorias). |
| `services/cliente-crm.service.ts` | Servicio Angular `cliente-crm.service`: llama API `/ cliente-crm` y expone Observables al UI. |
| `services/cliente-portal.service.ts` | Servicio Angular `cliente-portal.service`: llama API `/ cliente-portal` y expone Observables al UI. |
| `services/config-modulo.service.ts` | Servicio Angular `config-modulo.service`: llama API `/ config-modulo` y expone Observables al UI. |
| `services/configuracion.service.ts` | Servicio Angular `configuracion.service`: llama API `/ configuracion` y expone Observables al UI. |
| `services/conversacion.service.ts` | Servicio Angular `conversacion.service`: llama API `/ conversacion` y expone Observables al UI. |
| `services/crm.service.ts` | Servicio Angular `crm.service`: llama API `/ crm` y expone Observables al UI. |
| `services/cuota.service.ts` | Servicio Angular `cuota.service`: llama API `/ cuota` y expone Observables al UI. |
| `services/dashboard.service.ts` | Servicio Angular `dashboard.service`: llama API `/ dashboard` y expone Observables al UI. |
| `services/envio.service.ts` | Servicio Angular `envio.service`: llama API `/ envio` y expone Observables al UI. |
| `services/factura.service.ts` | Servicio Angular `factura.service`: llama API `/ factura` y expone Observables al UI. |
| `services/interaccion-crm.service.ts` | Servicio Angular `interaccion-crm.service`: llama API `/ interaccion-crm` y expone Observables al UI. |
| `services/lista-precio.service.ts` | Servicio Angular `lista-precio.service`: llama API `/ lista-precio` y expone Observables al UI. |
| `services/orden-compra.service.ts` | Servicio Angular `orden-compra.service`: llama API `/ orden-compra` y expone Observables al UI. |
| `services/orden-venta.service.ts` | Servicio Angular `orden-venta.service`: llama API `/ orden-venta` y expone Observables al UI. |
| `services/pago.service.ts` | Servicio para hablar con el backend de pagos (/pagos). |
| `services/pedido.service.ts` | Servicio para hablar con el backend de pedidos (/pedidos). |
| `services/perfil.service.ts` | Servicio para hablar con el backend de perfiles de cliente (/perfiles). |
| `services/permiso.service.ts` | Permisos RBAC en UI: consulta matriz del backend y resuelve si el rol puede una acción. |
| `services/plan-cuotas.service.ts` | Servicio para hablar con el backend de planes de cuotas (/planes). |
| `services/plantilla-print.service.ts` | Servicio Angular `plantilla-print.service`: llama API `/ plantilla-print` y expone Observables al UI. |
| `services/presupuesto.service.ts` | Servicio Angular `presupuesto.service`: llama API `/ presupuesto` y expone Observables al UI. |
| `services/product.ts` | Servicio Angular `product`: llama API `/ product` y expone Observables al UI. |
| `services/promocion.service.ts` | Servicio Angular `promocion.service`: llama API `/ promocion` y expone Observables al UI. |
| `services/remito.service.ts` | Servicio Angular `remito.service`: llama API `/ remito` y expone Observables al UI. |
| `services/resena.service.ts` | Servicio para hablar con el backend de resenas (/resenas). |
| `services/toast.service.ts` | Servicio Angular `toast.service`: llama API `/ toast` y expone Observables al UI. |
| `services/usuario.service.ts` | Servicio para hablar con el backend de usuarios (/usuarios). |
| `utils/busqueda-admin.ts` | — |
| `utils/canal-origen.ts` | Utilidad frontend `canal-origen`: helpers puros (validación, formato, exportación). |
| `utils/categoria-nombre.ts` | Utilidad frontend `categoria-nombre`: helpers puros (validación, formato, exportación). |
| `utils/export-csv.ts` | — |
| `utils/paginar.ts` | — |
| `utils/producto-canal.util.ts` | — |
| `utils/qrcode.ts` | Utilidad frontend `qrcode`: helpers puros (validación, formato, exportación). |
| `utils/stock-inventario.util.ts` | Utilidad frontend `stock-inventario.util`: helpers puros (validación, formato, exportación). |
| `utils/validadores-admin.ts` | — |
| `utils/validadores-form.ts` | — |
