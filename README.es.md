# Action Button PCF - Versión Española

## 📌 Descripción

Control de botón personalizable para Dynamics 365 basado en FluentUI que permite ejecutar funciones JavaScript o Custom APIs con configuración flexible.

## ✨ Características Principales

| Característica | Descripción |
|----------------|-------------|
| 🎨 **FluentUI** | Botones con el diseño estándar de Microsoft (Primary/Secondary) |
| ⚡ **Funciones JS** | Ejecuta cualquier función JavaScript global desde el formulario |
| 🔌 **Custom APIs** | Llama directamente a tus Custom APIs de Dynamics 365 || 🔄 **Indicador de Loading** | Muestra spinner animado durante la ejecución de acciones |
| 💬 **Respuesta Personalizable** | Configura qué campo de la respuesta mostrar al usuario || 🎛️ **Configurable** | Totalmente personalizable desde el diseñador de formularios |
| 🔒 **Seguro** | Manejo robusto de errores y validaciones |
| 🔄 **Integrado** | Refresco automático del formulario y notificaciones |

## 👍 Beneficios del Indicador de Loading

Cuando se hace clic en el botón:
- ✅ Se muestra un **spinner animado** que indica que el proceso está en ejecución
- ✅ El texto del botón cambia a **"Procesando..."**
- ✅ El botón se **deshabilita automáticamente** para evitar clics múltiples
- ✅ Proporciona **feedback visual inmediato** al usuario
- ✅ Mejora la **experiencia de usuario** significativamente

Esto elimina la confusión de "si la acción se está ejecutando o no".

## 🎯 Casos de Uso

### 1. Validaciones Personalizadas
Crea botones para validar datos antes de guardar:
- Verificar campos requeridos
- Validar formatos específicos
- Comprobar reglas de negocio complejas

### 2. Cálculos y Actualizaciones
Ejecuta cálculos y actualiza campos:
- Calcular totales, descuentos, impuestos
- Actualizar fechas programadas
- Generar números de serie o códigos

### 3. Integraciones
Conecta con sistemas externos:
- Llamar a servicios web externos
- Sincronizar datos con otras plataformas
- Enviar notificaciones

### 4. Workflows y Automatizaciones
Desencadena procesos:
- Iniciar Power Automate Flows
- Ejecutar workflows de Dynamics
- Activar acciones en cadena

### 5. Navegación Rápida
Facilita la navegación:
- Abrir registros relacionados
- Crear registros vinculados
- Mostrar vistas específicas

## 📊 Configuración visual

```
┌─────────────────────────────────────────┐
│  Formulario de Dynamics 365             │
│                                         │
│  Nombre: [__________________]           │
│  Email:  [__________________]           │
│  Teléf:  [__________________]           │
│                                         │
│  ┌─────────────────────┐                │
│  │  🔵 Validar Datos   │  ← Tu botón    │
│  └─────────────────────┘                │
│                                         │
│  [Guardar]  [Cancelar]                  │
└─────────────────────────────────────────┘
```

## 🔧 Propiedades del Control

### Button Label (Etiqueta)
- **Tipo**: Texto
- **Requerido**: Sí
- **Ejemplo**: "Calcular Total", "Validar Registro", "Enviar Email"

### Button Type (Tipo de Botón)
- **Opciones**: Primary (Azul) / Secondary (Gris)
- **Requerido**: Sí
- **Uso**: Primary para acciones principales, Secondary para acciones secundarias

### JavaScript Function Name (Función JS)
- **Tipo**: Texto
- **Requerido**: No
- **Formato**: `Namespace.FunctionName`
- **Ejemplo**: `MyCompany.validateAccount`

### Custom API Logical Name (Nombre de API)
- **Tipo**: Texto
- **Requerido**: No
- **Formato**: `prefix_apiname`
- **Ejemplo**: `tp_calculatediscount`

### Fields To Send (Campos a Enviar)
- **Tipo**: Texto (separados por comas)
- **Requerido**: No
- **Ejemplo**: `quantity,unitprice,discountpercentage`
- **Descripción**: Campos del formulario que se enviarán como parámetros a la Custom API

### Response Field To Show (Campo de Respuesta)
- **Tipo**: Texto
- **Requerido**: No
- **Ejemplo**: `message`, `result`, `status`
- **Descripción**: Campo de la respuesta JSON de la Custom API que se mostrará al usuario. Si no se especifica, se muestra un mensaje genérico.

### Disabled (Deshabilitado)
- **Tipo**: Sí/No
- **Requerido**: No
- **Uso**: Controla si el botón está activo o no

## 🚀 Inicio Rápido

### Paso 1: Compilar
```powershell
npm install
npm run build
```

### Paso 2: Crear Paquete
```powershell
mkdir Solutions
cd Solutions
pac solution init --publisher-name "MiEmpresa" --publisher-prefix "me"
pac solution add-reference --path ..
msbuild /t:build /restore
```

### Paso 3: Importar
1. Ve a make.powerapps.com
2. Soluciones → Importar
3. Selecciona el .zip generado
4. Sigue el asistente

### Paso 4: Configurar
1. Edita tu formulario
2. Agrega el control a un campo
3. Configura las propiedades
4. Publica

## 📖 Documentación Completa

- [README.md](README.md) - Documentación técnica completa
- [QUICKSTART.md](QUICKSTART.md) - Guía de inicio rápido
- [CHANGELOG.md](CHANGELOG.md) - Historial de cambios
- [examples/](examples/) - Ejemplos de código

## 🌐 Compatibilidad

| Plataforma | Compatible |
|------------|------------|
| Dynamics 365 Online | ✅ Sí |
| Power Apps | ✅ Sí |
| Dynamics 365 On-Premises | ⚠️ Requiere actualización |
| Model-Driven Apps | ✅ Sí |
| Canvas Apps | ❌ No (usar otro control) |

## 💡 Tips y Buenas Prácticas

### 1. Nomenclatura
- Usa nombres descriptivos para las funciones
- Siempre usa un namespace para evitar conflictos
- Prefija tus Custom APIs con tu código de publisher

### 2. Manejo de Errores
- Siempre valida los datos antes de procesar
- Muestra mensajes de error claros al usuario
- Registra errores en la consola para debugging

### 3. Performance
- Evita operaciones largas en funciones síncronas
- Usa Custom APIs asíncronas para procesos largos
- Limita las consultas a la base de datos

### 4. Seguridad
- Valida permisos antes de ejecutar acciones críticas
- No expongas información sensible en errores
- Usa Execute Privileges en Custom APIs

### 5. Testing
- Prueba en entorno de desarrollo primero
- Verifica en diferentes navegadores
- Prueba con diferentes roles de seguridad

## 🐛 Solución de Problemas Comunes

### El botón no aparece
```
✓ Verifica que el control esté habilitado para Web
✓ Publica las personalizaciones
✓ Refresca el caché (Ctrl+F5)
```

### Error al ejecutar función JS
```
✓ Verifica el nombre de la función (case-sensitive)
✓ Asegúrate de que la biblioteca esté en el formulario
✓ Revisa la consola (F12) para ver el error exacto
```

### Error al ejecutar Custom API
```
✓ Verifica el logical name de la API
✓ Comprueba los permisos de seguridad
✓ Asegúrate de que la API esté publicada
```

## 📞 Soporte

Para reportar problemas o solicitar características:
1. Revisa la documentación completa
2. Verifica los ejemplos incluidos
3. Consulta los logs en la consola del navegador

## 📜 Licencia

MIT License - Libre para uso comercial y personal

## 👨‍💻 Autor

**Pablo Fernández Carbayo**
- LinkedIn: [Pablo Fernández Carbayo](https://www.linkedin.com/in/pablo-fernandez-carbayo-505b11141/)

---

**Desarrollado con ❤️ para la comunidad de Dynamics 365**
