# Action Button PCF Control

Control PCF (PowerApps Component Framework) para Dynamics 365 que proporciona un botón personalizable basado en FluentUI con capacidad de ejecutar funciones JavaScript o Custom APIs.

## 🎯 Características

- ✅ Botón personalizable con estilos FluentUI (Primary/Secondary)
- ✅ Ejecuta funciones JavaScript personalizadas
- ✅ Ejecuta Custom APIs de Dynamics 365
- ✅ Totalmente configurable desde el diseñador de formularios
- ✅ Soporte para deshabilitar el botón dinámicamente
- ✅ Manejo de errores y notificaciones al usuario

## 📋 Requisitos Previos

Antes de compilar el proyecto, necesitas tener instalado:

1. **Node.js** (versión 14 o superior)
   - Descarga: https://nodejs.org/

2. **PowerApps CLI** (Herramientas de PCF)
   ```powershell
   pac install latest
   ```
   O instalar el MSI desde: https://aka.ms/PowerAppsCLI

3. **Visual Studio Code** (recomendado)
   - Descarga: https://code.visualstudio.com/

## 🚀 Instalación y Compilación

### 1. Instalar dependencias

```powershell
npm install
```

### 2. Compilar el control

```powershell
npm run build
```

### 3. Probar en modo desarrollo (opcional)

```powershell
npm start
```

Esto abrirá el test harness en tu navegador para probar el control localmente.

### 4. Crear el paquete de solución para Dynamics 365

```powershell
# Crear directorio de solución
mkdir Solutions
cd Solutions
pac solution init --publisher-name TuPublisher --publisher-prefix tp

# Agregar referencia al control
pac solution add-reference --path ..

# Compilar el paquete
msbuild /t:build /restore
```

El archivo `.zip` generado estará en la carpeta `Solutions\bin\Debug`.

## 📦 Importar a Dynamics 365

1. Ir a **Power Apps** (make.powerapps.com)
2. Seleccionar tu entorno
3. Ir a **Soluciones** → **Importar solución**
4. Seleccionar el archivo `.zip` generado
5. Seguir el asistente de importación

## ⚙️ Configuración del Control

Una vez importado, puedes agregar el control a un formulario:

### 1. Editar el formulario

1. Ir a tu tabla (entidad) en Power Apps
2. Abrir el formulario donde quieres agregar el botón
3. Agregar un campo de texto de una sola línea (este será el campo vinculado)
4. Seleccionar el campo → **Propiedades**
5. En **Controles**, hacer clic en **+ Agregar control**
6. Seleccionar **Action Button**

### 2. Configurar las propiedades

El control tiene las siguientes propiedades configurables:

| Propiedad | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| **Button Label** | Texto | Sí | El texto que se mostrará en el botón |
| **Button Type** | Enum | Sí | Estilo del botón: `Primary` o `Secondary` |
| **JavaScript Function Name** | Texto | No | Nombre de la función JS global a ejecutar (ej: `MyNamespace.myFunction`) |
| **Custom API Logical Name** | Texto | No | Logical name de la Custom API a ejecutar |
| **Disabled** | Sí/No | No | Indica si el botón está deshabilitado |

### 3. Ejemplos de configuración

#### Ejemplo 1: Ejecutar una función JavaScript

```javascript
// En tu biblioteca JavaScript (Web Resource)
var MyNamespace = MyNamespace || {};

MyNamespace.validateRecord = function(executionContext) {
    var formContext = executionContext.getFormContext();
    
    // Tu lógica aquí
    var accountName = formContext.getAttribute("name").getValue();
    
    if (!accountName) {
        Xrm.Navigation.openAlertDialog({
            text: "Por favor, ingresa un nombre de cuenta",
            title: "Validación"
        });
        return;
    }
    
    Xrm.Navigation.openAlertDialog({
        text: "Registro validado correctamente",
        title: "Éxito"
    });
};
```

**Configuración del control:**
- Button Label: `Validar Registro`
- Button Type: `Primary`
- JavaScript Function Name: `MyNamespace.validateRecord`
- Custom API Logical Name: *(dejar vacío)*

#### Ejemplo 2: Ejecutar una Custom API

Primero, crea una Custom API en Dynamics 365:

1. Ir a **Configuración** → **Personalizaciones** → **Custom Process Actions**
2. O crear una Custom API mediante código/solution
3. Ejemplo: `tp_CalculateDiscount` (logical name)

**Configuración del control:**
- Button Label: `Calcular Descuento`
- Button Type: `Primary`
- JavaScript Function Name: *(dejar vacío)*
- Custom API Logical Name: `tp_CalculateDiscount`

#### Ejemplo 3: Deshabilitar dinámicamente el botón

Puedes usar una regla de negocio o JavaScript para controlar la propiedad `Disabled`:

```javascript
// Deshabilitar el botón si el estado es "Cerrado"
function onLoad(executionContext) {
    var formContext = executionContext.getFormContext();
    var status = formContext.getAttribute("statecode").getValue();
    
    // Establecer el valor del campo vinculado al control
    // Esto deshabilitará el botón si el estado es 1 (Inactivo)
    formContext.getAttribute("yourfieldname").setDisabled(status === 1);
}
```

## 🔧 Prioridad de Ejecución

Cuando se hace clic en el botón:

1. **Primero** se verifica si hay una función JavaScript configurada → se ejecuta
2. **Si no**, se verifica si hay una Custom API configurada → se ejecuta
3. **Si no hay ninguna**, se muestra una advertencia en la consola

## 🐛 Solución de Problemas

### El botón no se muestra

- Verifica que el control esté habilitado para Web, Phone y Tablet
- Asegúrate de que el campo esté visible en el formulario
- Revisa la consola del navegador para errores

### Error al ejecutar función JavaScript

- Verifica que el nombre de la función sea correcto (case-sensitive)
- Asegúrate de que la biblioteca de JavaScript esté agregada al formulario
- La función debe estar disponible en el contexto global (`window`)
- La función debe aceptar un parámetro `executionContext`

### Error al ejecutar Custom API

- Verifica que el logical name sea correcto
- Asegúrate de que la Custom API esté publicada
- Revisa los permisos de seguridad del usuario
- El usuario debe tener permisos para ejecutar la Custom API

### El botón no responde a clics

- Verifica que la propiedad `Disabled` no esté en `true`
- Revisa la consola del navegador para errores
- Asegúrate de que no haya reglas de negocio que bloqueen el formulario

## 📝 Estructura del Proyecto

```
ActionButton/
│
├── index.ts                      # Lógica principal del control
├── ControlManifest.Input.xml     # Definición del control y propiedades
├── package.json                  # Dependencias npm
├── tsconfig.json                 # Configuración TypeScript
├── ActionButton.pcfproj          # Archivo de proyecto PCF
├── .gitignore                    # Archivos ignorados por Git
│
├── strings/
│   └── ActionButton.1033.resx    # Recursos de texto (inglés)
│
└── README.md                     # Esta documentación
```

## 🤝 Contribuciones

Si encuentras un bug o tienes una sugerencia de mejora, por favor crea un issue o pull request.

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 📚 Recursos Adicionales

- [Documentación oficial de PCF](https://docs.microsoft.com/en-us/powerapps/developer/component-framework/overview)
- [FluentUI React Components](https://developer.microsoft.com/en-us/fluentui#/controls/web)
- [Custom APIs en Dynamics 365](https://docs.microsoft.com/en-us/powerapps/developer/data-platform/custom-api)
- [Web API de Dynamics 365](https://docs.microsoft.com/en-us/powerapps/developer/data-platform/webapi/overview)

## 👨‍💻 Autor

**Pablo Fernández Carbayo**
- LinkedIn: [Pablo Fernández Carbayo](https://www.linkedin.com/in/pablo-fernandez-carbayo-505b11141/)

Desarrollado para Dynamics 365

---

**¡Disfruta usando el Action Button PCF Control!** 🚀
