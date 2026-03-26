# Action Button PCF Control

Control PCF (PowerApps Component Framework) para Dynamics 365 que proporciona un botón personalizable basado en FluentUI con capacidad de ejecutar funciones JavaScript o Custom APIs.

## 🎯 Características

- ✅ Botón personalizable con estilos FluentUI (Primary/Secondary)
- ✅ Forma configurable: Rounded, Circular o Square
- ✅ Tamaño configurable: Small, Medium o Large
- ✅ Ejecuta funciones JavaScript personalizadas (recibe `executionContext` y `contextValue`)
- ✅ Ejecuta Custom APIs de Dynamics 365 con envío automático de campos del formulario
- ✅ Totalmente configurable desde el diseñador de formularios moderno
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

| Propiedad | Tipo | Uso | Requerido | Descripción |
|-----------|------|-----|-----------|-------------|
| **Button Label** | Texto | Input | Sí | Texto que se muestra en el botón |
| **Context Value** | Texto | Bound | No | Campo del formulario cuyo valor se pasa como segundo argumento a la función JS o a la Custom API |
| **Button Type** | Enum | Input | No | Estilo del botón: `Primary` (0) o `Secondary` (1) |
| **Shape** | Enum | Input | No | Forma del botón: `Rounded` (0), `Circular` (1) o `Square` (2) |
| **Button Size** | Enum | Input | No | Tamaño: `Small` (0), `Medium` (1) o `Large` (2) |
| **JavaScript Function Name** | Texto | Input | No | Nombre de la función JS global a ejecutar (ej: `MyNS.myFunction`) |
| **Custom API Logical Name** | Texto | Input | No | Logical name de la Custom API a ejecutar |
| **Fields To Send** | Texto | Input | No | Nombres lógicos separados por comas de los campos del formulario que se enviarán como parámetros a la Custom API (ej: `name,telephone1,emailaddress1`) |
| **Disabled** | Sí/No | Bound | No | Indica si el botón está deshabilitado. Puede vincularse a una columna Sí/No de la tabla |

> **Nota**: `Context Value` es un campo `Bound` (vinculado a una columna del formulario). Es necesario para que el control funcione en el **diseñador de formularios moderno**. Su valor se pasa automáticamente a la función JS y a la Custom API.

### 3. Ejemplos de configuración

#### Ejemplo 1: Ejecutar una función JavaScript

La función recibe dos parámetros: `executionContext` (contexto del formulario) y `contextValue` (el valor del campo vinculado).

```javascript
// En tu Web Resource JavaScript
let MyNamespace = MyNamespace || {};

MyNamespace.validateRecord = function(executionContext, contextValue) {
    let formContext = executionContext.getFormContext();
    
    // contextValue contiene el valor del campo vinculado en "Context Value"
    console.log("Valor del contexto:", contextValue);
    
    let accountName = formContext.getAttribute("name").getValue();
    
    if (!accountName) {
        Xrm.Navigation.openAlertDialog({
            text: "Por favor, ingresa un nombre de cuenta"
        });
        return;
    }
    
    Xrm.Navigation.openAlertDialog({
        text: "Registro validado correctamente"
    });
};
```

**Configuración del control:**
- Button Label: `Validar Registro`
- Button Type: `Primary`
- Shape: `Rounded`
- Button Size: `Medium`
- JavaScript Function Name: `MyNamespace.validateRecord`
- Context Value: *(vincular a un campo del formulario, o dejar vacío)*

#### Ejemplo 2: Ejecutar una Custom API con campos del formulario

Puedes enviar múltiples campos del formulario a tu Custom API usando `Fields To Send`:

**Configuración del control:**
- Button Label: `Calcular Descuento`
- Button Type: `Primary`
- Custom API Logical Name: `ero_CalculateDiscount`
- Fields To Send: `quantity,unitprice,discountpercentage`
- Context Value: *(vincular al campo donde estará el resultado, por ejemplo `discountamount`)*

La Custom API recibirá un request con los parámetros:
```
quantity        → valor del campo "quantity" del formulario
unitprice       → valor del campo "unitprice" del formulario
discountpercentage → valor del campo "discountpercentage" del formulario
contextValue    → valor actual del campo vinculado en "Context Value"
```

#### Ejemplo 3: Botón circular y pequeño (icono-like)

Útil para botones de acción compactos junto a otros controles:

- Button Label: `✓`
- Button Type: `Primary`
- Shape: `Circular`
- Button Size: `Small`
- JavaScript Function Name: `MyNamespace.quickApprove`

#### Ejemplo 4: Deshabilitar dinámicamente el botón

Vincula la propiedad `Disabled` a una columna **Sí/No** de la tabla directamente desde el diseñador de formularios (activar el checkbox "Enlazar a columna de tabla"), o controla el estado mediante una regla de negocio sobre esa columna:

```javascript
// El botón siempre está activo, pero la función comprueba el estado
MyNamespace.checkAndExecute = function(executionContext, contextValue) {
    let formContext = executionContext.getFormContext();
    let status = formContext.getAttribute("statecode").getValue();
    
    if (status !== 0) {
        Xrm.Navigation.openAlertDialog({ text: "Solo se puede ejecutar en registros activos." });
        return;
    }
    
    // Continuar con la lógica...
};
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
