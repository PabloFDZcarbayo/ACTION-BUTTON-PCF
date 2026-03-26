# 🚀 Quick Start - Action Button PCF

## Inicio Rápido (5 minutos)

### 1. Instalar y Compilar
```powershell
# Navegar al directorio del proyecto
cd c:\Users\pablo\source\repos\ActionButton

# Instalar dependencias
npm install

# Compilar el control
npm run build
```

### 2. Probar Localmente (Opcional)
```powershell
npm start
```
Se abrirá una ventana del navegador con el test harness.

### 3. Crear Paquete para Dynamics 365

#### Opción A: Crear paquete completo (Recomendado)
```powershell
# Crear carpeta de solución
mkdir Solutions
cd Solutions

# Inicializar solución (reemplaza los valores)
pac solution init --publisher-name "TuEmpresa" --publisher-prefix "tp"

# Agregar referencia al control
pac solution add-reference --path ..

# Volver al directorio Solutions
cd Solutions

# Compilar
msbuild /t:build /restore

# El archivo .zip estará en: Solutions\bin\Debug\
```

#### Opción B: Crear paquete rápido (Solo para desarrollo)
```powershell
# En el directorio raíz del proyecto
npm run build

# Crear carpeta temporal
mkdir temp-solution
cd temp-solution

pac solution init --publisher-name "Dev" --publisher-prefix "dev"
pac solution add-reference --path ..
msbuild /t:build /restore
```

### 4. Importar a Dynamics 365

1. Ve a https://make.powerapps.com
2. Selecciona tu entorno
3. **Soluciones** → **Importar solución**
4. Sube el archivo `.zip` de `Solutions\bin\Debug\`
5. Sigue el asistente

### 5. Agregar al Formulario

1. Edita tu formulario (ej: Account)
2. Agrega un campo de texto (o usa uno existente) — este será el campo para **Context Value**
3. **Propiedades del campo** → **Controles** → **Agregar control**
4. Selecciona **Action Button**
5. Configura las propiedades:

| Propiedad | Descripción | Ejemplo |
|-----------|-------------|---------|
| **Button Label** | Texto del botón (input libre) | `"Ejecutar"` |
| **Context Value** | Campo del formulario vinculado (se pasa a la función/API) | columna del formulario |
| **Button Type** | `Primary` o `Secondary` | `Primary` |
| **Shape** | `Rounded`, `Circular` o `Square` | `Rounded` |
| **Button Size** | `Small`, `Medium` o `Large` | `Medium` |
| **JavaScript Function Name** | Función JS a ejecutar | `"MyNS.myFunction"` |
| **Custom API Logical Name** | API a ejecutar | `"ero_MyCustomApi"` |
| **Fields To Send** | Campos del formulario a enviar a la API (separados por comas) | `"name,telephone1"` |
| **Disabled** | Deshabilitar el botón | `false` |

### 6. Configurar Acción

#### Opción 1: Función JavaScript

La función recibe **dos parámetros**: `executionContext` y `contextValue` (valor del campo vinculado).

```javascript
// Crear Web Resource: my_script.js
let MyNamespace = MyNamespace || {};

MyNamespace.myFunction = function(executionContext, contextValue) {
    let formContext = executionContext.getFormContext();
    
    // contextValue es el valor del campo vinculado en "Context Value"
    console.log("contextValue:", contextValue);
    
    Xrm.Navigation.openAlertDialog({
        text: "¡Botón clickeado! Contexto: " + contextValue
    });
};
```
- Sube como Web Resource
- Agrégalo al formulario
- Configura: **JavaScript Function Name** = `MyNamespace.myFunction`

#### Opción 2: Custom API con campos del formulario

```
// Configuración del control:
// Custom API Logical Name  = "ero_ProcessRecord"
// Fields To Send           = "name,telephone1,emailaddress1"
// Context Value            = (columna del formulario, p.ej. "description")
```

La Custom API recibirá como parámetros de entrada:
- `name`, `telephone1`, `emailaddress1` → valores de los campos del formulario
- `contextValue` → valor del campo vinculado (si está configurado)
- Crea una Custom API en Dynamics 365
- Configura: **Custom API Logical Name** = `my_calculatediscount`

## ⚡ Comandos Útiles

```powershell
# Compilar
npm run build

# Limpiar compilación
npm run clean

# Recompilar (clean + build)
npm run rebuild

# Modo desarrollo
npm start

# Verificar tipos
npm run refreshTypes
```

## 🐛 Problemas Comunes

### Error: "pac: command not found"
**Solución**: Instala PowerApps CLI
```powershell
# Descargar e instalar desde:
# https://aka.ms/PowerAppsCLI
```

### Error al compilar: "MSBuild not found"
**Solución**: Instala Visual Studio Build Tools
```powershell
# Descargar desde:
# https://visualstudio.microsoft.com/downloads/
# Seleccionar: "Build Tools for Visual Studio"
```

### El control no aparece en el formulario
**Solución**:
1. Verifica que la solución se importó correctamente
2. Publica todas las personalizaciones
3. Refresca el caché del navegador (Ctrl+F5)
4. Habilita el control para Web/Phone/Tablet

## 📚 Siguientes Pasos

- Lee el [README.md](README.md) completo para documentación detallada
- Revisa los ejemplos en [examples/ActionButtonExamples.js](examples/ActionButtonExamples.js)

## ⚠️ Nota sobre el Diseñador de Formularios Moderno

El control requiere que **Context Value** esté vinculado a un campo del formulario para funcionar en el diseñador moderno. Si ves el mensaje *"Este componente solo se puede editar en el diseñador clásico"*, asegúrate de haber vinculado ese campo. El campo puede ser cualquier columna de texto de la tabla, incluso si no la usas para nada más.
- Personaliza el control según tus necesidades

## 🤝 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Verifica los logs de compilación
3. Consulta la documentación oficial de PCF

---

**¡Listo para usar! 🎉**
