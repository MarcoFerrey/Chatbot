import { EVENTS } from '@builderbot/bot'
import { utils } from '@builderbot/bot'
import { addKeyword } from '@builderbot/bot'

export const flowSatisfaccion = addKeyword(utils.setEvent('Satisfaccion')).addAnswer(['*1. En una escala del 1 al 10, ¿qué nota le das al servicio recibido?* (1 = muy malo / 10 = excelente)\n ✍🏼 Solo responde con el número\n 📌 Si escribes fuera de ese rango, te pediremos que respondas nuevamente (del 1 al 10).'], {capture: true, delay: 1000},
    async (ctx, ctxFn) => {
        const n = ctx.body.trim()
        if(!["1","2","3","4","5","6","7","8","9","10"].includes(n)){
            return ctxFn.fallBack('⚠️ Ups, al parecer hubo un error. Por favor indica tu respuesta del *1 al 10* para calificar correctamente el servicio brindado por CVA')
        }
        //Guardando la respuesta
        await ctxFn.state.update({
            puntaje: n
        })
        // Enviando a Google Apps Scripts la RPTas de la primera pregunta
        try{
            await fetch('https://script.google.com/macros/s/AKfycbyCFwwVrLsKG_xPC1t2P_yntt7u_chTxIDGCuQUue-m-AFIqNmExnv0Jk2wtsXVoTGQdQ/exec', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    celular: ctx.from,
                    calificacion: n,
                    comentario: '-',
                    fecha: new Date().toISOString(),
                    evento: 'Satisfaccion'
                })
            })
        }catch(error){
            console.error('Error enviando a Sheets:', error)
        }

        if(["1","2","3","4","5"].includes(n)){
            return ctxFn.gotoFlow(flowBajo_satisfaccion)
        }
        if(["6","7","8"].includes(n)){
            return ctxFn.gotoFlow(flowMedio_satisfaccion)
        }
        if(["9","10"].includes(n)){
            return ctxFn.gotoFlow(flowAlto_satisfaccion)
        }
    }
)

export const flowBajo_satisfaccion = addKeyword(EVENTS.ACTION)
.addAnswer('✅*Gracias por tu calificación.* \n\n 👉🏼 *2. ¿Por qué diste esa calificación?* \n\n*1.* El servicio no cumplió con lo prometido.\n*2.* El producto no fue de calidad.\n*3.* Mala atención o poco soporte técnico.\n*4*. 4. Tiempo de respuesta muy lento (en campo o remoto). \n\nSelecciona un número del *1 al 4* por favor.\n📌 Si te equivocas en este paso, solo vuelve a escribir el número del 1 al 4 😉', {captrue: true, delay: 1000}, 
    async (ctx, ctxFn) => {
        const lista = ["El servicio no cumplió con lo prometido.", "El producto no fue de calidad", "Mala atención o poco soporte técnico", "Tiempo de respuesta muy lento (en campo o remoto)."]

        const n = ctx.body.trim()

        if(!["1","2","3","4"].includes(n)){
            return ctxFn.fallBack('⚠️ Ups, al parecer hubo un error. Por favor indica tu respuesta del *1 al 4* para validar correctamente el motivo de la calificación')
        }
        const texto = lista[parseInt(n) - 1]

        await ctxFn.state.update({
            motivo: texto
        })

        try{
            await fetch('https://script.google.com/macros/s/AKfycbyCFwwVrLsKG_xPC1t2P_yntt7u_chTxIDGCuQUue-m-AFIqNmExnv0Jk2wtsXVoTGQdQ/exec', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    celular: ctx.from,
                    calificacion: ctxFn.state.get('puntaje'),
                    comentario: texto,
                    fecha: new Date().toISOString(),
                    evento: 'Satisfaccion'
                })
            })
            await ctxFn.state.clear()
            await ctxFn.gotoFlow(flowTerminado_satisfaccion)
        }catch(err){
            console.error('Error enviando a Sheets:', err)
        }
    }
)

export const flowMedio_satisfaccion = addKeyword(EVENTS.ACTION).addAnswer('✅*Gracias por tu calificación.* \n\n ¿Podrías contarnos brevemente el motivo de tu puntaje? 💬🤔 \n\n*1.* Buen desempeño del producto\n*2.* Atención adecuada.\n*3.* Entrega dentro del tiempo esperado.\n*4*. Precio razonable. \n\nSelecciona un número del *1 al 4* por favor.\n📌 Si te equivocas en este paso, solo vuelve a escribir el número del 1 al 4 😉', {capture: true, delay: 1000}, 
    async (ctx, ctxFn) => {
        const lista = ["1. Buen desempeño del producto", "2. Atención adecuada", "3. Entrega dentro del tiempo esperado", "4. Precio razonable."]

        const n = ctx.body.trim()

        if(!["1","2","3","4"].includes(n)){
            return ctxFn.fallBack('⚠️ Ups, al parecer hubo un error. Por favor indica tu respuesta del *1 al 4* para validar correctamente el motivo de la calificación')
        }
        const texto = lista[parseInt(n) - 1]

        await ctxFn.state.update({
            motivo: texto
        })

        try{
            await fetch('https://script.google.com/macros/s/AKfycbyCFwwVrLsKG_xPC1t2P_yntt7u_chTxIDGCuQUue-m-AFIqNmExnv0Jk2wtsXVoTGQdQ/exec', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    celular: ctx.from,
                    calificacion: ctxFn.state.get('puntaje'),
                    comentario: texto,
                    fecha: new Date().toISOString(),
                    evento: 'Satisfaccion'
                })
            })
            await ctxFn.state.clear()
            await ctxFn.gotoFlow(flowTerminado_satisfaccion)
        }catch(err){
            console.error('Error enviando a Sheets:', err)
        }
    }
)

export const flowAlto_satisfaccion = addKeyword(EVENTS.ACTION).addAnswer('✅*Gracias por tu calificación.* \n\n ¿Podrías contarnos brevemente el motivo de tu puntaje? 💬🤔 \n\n*1.* Excelente calidad de equipos o servicios.\n*2.* Atención rápida y efectiva, incluso en campo.\n*3.* Entrega o soporte sin demoras.\n*4*. Buen costo-beneficio. \n\nSelecciona un número del *1 al 4* por favor.\n📌 Si te equivocas en este paso, solo vuelve a escribir el número del 1 al 4 😉', {capture: true, delay: 1000}, 
    async (ctx, ctxFn) => {
        const lista = ["Excelente calidad de equipos o servicios", "Atención rápida y efectiva, incluso en campo", "Entrega o soporte sin demoras", "Buen costo-beneficio"]

        const n = ctx.body.trim()

        if(!["1","2","3","4"].includes(n)){
            return ctxFn.fallBack('⚠️ Ups, al parecer hubo un error. Por favor indica tu respuesta del *1 al 4* para validar correctamente el motivo de la calificación')
        }
        const texto = lista[parseInt(n) - 1]

        try{
            await fetch('https://script.google.com/macros/s/AKfycbyCFwwVrLsKG_xPC1t2P_yntt7u_chTxIDGCuQUue-m-AFIqNmExnv0Jk2wtsXVoTGQdQ/exec', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    celular: ctx.from,
                    calificacion: ctxFn.state.get('puntaje'),
                    comentario: texto,
                    fecha: new Date().toISOString(),
                    evento: 'Satisfaccion'
                })
            })
            await ctxFn.state.clear()
            await ctxFn.gotoFlow(flowTerminado_satisfaccion)
        }catch(err){
            console.error('Error enviando a Sheets:', err)
        }
    }
)

export const flowTerminado_satisfaccion = addKeyword(EVENTS.ACTION).addAnswer('💬 *¡Gracias por tomarte el tiempo!*\n\n Tu opinión nos permite seguir mejorando el soporte que damos a tu operación en campo 💪🏼🛠️\nContamos contigo para seguir avanzando.')