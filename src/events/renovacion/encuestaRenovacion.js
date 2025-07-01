import { EVENTS } from '@builderbot/bot'
import { utils } from '@builderbot/bot'
import { addKeyword } from '@builderbot/bot'

export const flowRenovacion = addKeyword(utils.setEvent('Renovacion'))
.addAnswer('¿Estás interesado en renovar tu acuerdo CVA?\n  Escriba del *1 al 3* según las opcciones\n *1.* ✅ Sí, deseo renovarlo\n *2.* 🤔 Aún lo estoy evaluando\n *3.* ❌ No deseo renovarlo', {capture: true, delay: 1000}, 
    async (ctx, ctxFn) => {
        const lista = ["Sí, deseo renovarlo", "Aún lo estoy pensando", "No deseo renovarlo"]
        const input = ctx.body.trim()
        if(!["1", "2", "3"].includes(input)){
            return ctxFn.fallBack('⚠️ Ups, al parecer hubo un error en la respuesta. Por favor indica tu respuesta del *1 al 3* para calificar correctamente la intentción de renovar el CVA')
        }
        //Guardar respuesta
        const respuesta = lista[parseInt(input) - 1]
        await ctxFn.state.update({
            puntaje: respuesta
        })
        const series = ctxFn.state.get('series')
        const cliente = ctxFn.state.get('cliente')
        const planes = ctxFn.state.get('planes')
        const modelos = ctxFn.state.get('modelos')
        const inicios = ctxFn.state.get('inicios')
        const correos = ctxFn.state.get('correos')
        console.log(`Serie: ${series}`)
        // Enviando a Google Apps Scripts la RPTas de la primera pregunta
        // 2) Lanzas la petición sin `await` (fire-and-forget)
        fetch('https://script.google.com/macros/s/AKfycbyCFwwVrLsKG_xPC1t2P_yntt7u_chTxIDGCuQUue-m-AFIqNmExnv0Jk2wtsXVoTGQdQ/exec', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              celular: ctx.from.slice(2),
              calificacion: respuesta,
              comentario: '-',
              fecha: new Date().toISOString(),
              evento: 'Renovacion',
              series: series,
              cliente: cliente,
              modelos: modelos,
              planes: planes,
              inicios: inicios,
              correos: correos
            })
        })
        .then(res => {
            if (!res.ok) console.error('Sheets devolvieron status', res.status)
        })
        .catch(err => console.error('Error enviando a Sheets:', err))

        if(respuesta == 'Sí, deseo renovarlo'){
            return ctxFn.gotoFlow(flowRenovar)
        }
        if(respuesta == 'Aún lo estoy pensando'){
            return ctxFn.gotoFlow(flowTalvez)
        }
        if(respuesta == 'No deseo renovarlo'){
            return ctxFn.gotoFlow(flowNorenovar)
        }
    }
)

export const flowRenovar = addKeyword(EVENTS.ACTION).addAnswer('🙌🏼 ¡Gracias por seguir confiando en nosotros! Y como última pregunta.\n*¿Qué motivo te llevó a renovar tu acuerdo CVA?*\n\nEscriba un número del *1 al 4* según la opción\n\n*1.* 🚠 Estoy satisfecho con el servicio recibido\n *2.* 📞 Me siento bien atendido por el equipo\n *3.* 💰 El servicio justifica su valor\n *4.* 🚜 Me ayuda a mantener mis equipos operativos', {capture: true, delay: 1000},
    async (ctx, ctxFn) => {
        const lista = ["Estoy satisfecho con el servicio recibido", "Me siento bien atendido por el equipo", "El servicio justifica su valor", "Me ayuda a mantener mis equipos operativos"]
        const input = ctx.body.trim()
        if(!["1","2","3","4"].includes(input)){
            return ctxFn.fallBack('⚠️ Ups, al parecer hubo un error en la respuesta. Por favor indica tu respuesta del *1 al 4* para calificar correctamente la intentción de renovar el CVA')
        }
        const texto = lista[parseInt(input) - 1]

        // Guardando localmente
        await ctxFn.state.update({
            motivo: texto
        })

        const series = ctxFn.state.get('series')
        const cliente = ctxFn.state.get('cliente')
        const planes = ctxFn.state.get('planes')
        const modelos = ctxFn.state.get('modelos')
        const inicios = ctxFn.state.get('inicios')
        const correos = ctxFn.state.get('correos')
        console.log(`Serie: ${series}`)

        //Enviando a Google Sheets
        fetch('https://script.google.com/macros/s/AKfycbyCFwwVrLsKG_xPC1t2P_yntt7u_chTxIDGCuQUue-m-AFIqNmExnv0Jk2wtsXVoTGQdQ/exec', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              celular: ctx.from.slice(2),
              calificacion: ctxFn.state.get('puntaje'),
              comentario: texto,
              fecha: new Date().toISOString(),
              evento: 'Renovacion',
              series: series,
              cliente: cliente,
              modelos: modelos,
              planes: planes,
              inicios: inicios,
              correos: correos,
            })
        })
        .then(res => {
            if (!res.ok) console.error('Sheets devolvieron status', res.status)
        })
        .catch(err => console.error('Error enviando a Sheets:', err))

        await ctxFn.state.clear()
        await ctxFn.gotoFlow(flowTerminado_renovacion)
    }
)

export const flowTalvez = addKeyword(EVENTS.ACTION).addAnswer('Gracias por tu sinceridad. Queremos ayudarte a tomar la mejor decisión 👇🏼\n\nEscriba un número del *1 al 4* según la opción\n\n*1.* 📈 Quiero más información sobre el plan\n *2.* 💰 Deseo revisar los precios y condiciones\n *3.* 📞 Quiero que un asesor me llame\n *4.* ⏳ Prefiero que me contacten más adelante', {capture: true, delay: 1000},
    async (ctx, ctxFn) => {
        const lista = ["Quiero más información sobre el plan", "Deseo revisar los precios y condiciones", "Quiero que un asesor me llame", "Prefiero que me contacten más adelante"]
        const input = ctx.body.trim()
        if(!["1","2","3","4"].includes(input)){
            return ctxFn.fallBack('⚠️ Ups, al parecer hubo un error en la respuesta. Por favor indica tu respuesta del *1 al 4* para calificar correctamente la intentción de renovar el CVA')
        }
        const texto = lista[parseInt(input) - 1]

        // Guardando localmente
        await ctxFn.state.update({
            motivo: texto
        })

        const series = ctxFn.state.get('series')
        const cliente = ctxFn.state.get('cliente')
        const planes = ctxFn.state.get('planes')
        const modelos = ctxFn.state.get('modelos')
        const inicios = ctxFn.state.get('inicios')
        const correos = ctxFn.state.get('correos')
        console.log(`Serie: ${series}`)

        //Enviando a Google Sheets
        fetch('https://script.google.com/macros/s/AKfycbyCFwwVrLsKG_xPC1t2P_yntt7u_chTxIDGCuQUue-m-AFIqNmExnv0Jk2wtsXVoTGQdQ/exec', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              celular: ctx.from.slice(2),
              calificacion: ctxFn.state.get('puntaje'),
              comentario: texto,
              fecha: new Date().toISOString(),
              evento: 'Renovacion',
              series: series,
              cliente: cliente,
              modelos: modelos,
              planes: planes,
              inicios: inicios,
              correos: correos
            })
        })
        .then(res => {
            if (!res.ok) console.error('Sheets devolvieron status', res.status)
        })
        .catch(err => console.error('Error enviando a Sheets:', err))

        await ctxFn.state.clear()
        await ctxFn.gotoFlow(flowTerminado_renovacion)
    }
)

export const flowNorenovar = addKeyword(EVENTS.ACTION).addAnswer('Gracias por tu respuesta 🙏🏼 *¿Podrías contarnos el motivo?*\n\nEscriba un número del *1 al 4* según la opción\n\n*1.* 💵 El costo es alto para mi operación\n *2.* 🚠 Prefiero hacer el mantenimiento por cuenta propia\n *3.* 🔚 Ya no tengo la máquina\n *4.* 🤐 Prefiero no decirlo', {capture: true, delay: 1000},
    async (ctx, ctxFn) => {
        const lista = ["El costo es alto para mi operación", "Prefiero hacer el mantenimiento por cuenta propia", "Ya no tengo la máquina", "Prefiero no decirlo"]
        const input = ctx.body.trim()
        if(!["1","2","3","4"].includes(input)){
            return ctxFn.fallBack('⚠️ Ups, al parecer hubo un error en la respuesta. Por favor indica tu respuesta del *1 al 4* para calificar correctamente la intentción de renovar el CVA')
        }
        const texto = lista[parseInt(input) - 1]

        // Guardando localmente
        await ctxFn.state.update({
            motivo: texto
        })

        const series = ctxFn.state.get('series')
        const cliente = ctxFn.state.get('cliente')
        const planes = ctxFn.state.get('planes')
        const modelos = ctxFn.state.get('modelos')
        const inicios = ctxFn.state.get('inicios')
        const correos = ctxFn.state.get('correos')
        console.log(`Serie: ${series}`)

        //Enviando a Google Sheets
        fetch('https://script.google.com/macros/s/AKfycbyCFwwVrLsKG_xPC1t2P_yntt7u_chTxIDGCuQUue-m-AFIqNmExnv0Jk2wtsXVoTGQdQ/exec', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              celular: ctx.from.slice(2),
              calificacion: ctxFn.state.get('puntaje'),
              comentario: texto,
              fecha: new Date().toISOString(),
              evento: 'Renovacion',
              series: series,
              cliente: cliente,
              modelos: modelos,
              planes: planes,
              inicios: inicios,
              correos: correos,
            })
        })
        .then(res => {
            if (!res.ok) console.error('Sheets devolvieron status', res.status)
        })
        .catch(err => console.error('Error enviando a Sheets:', err))

        await ctxFn.state.clear()
        await ctxFn.gotoFlow(flowTerminado_renovacion)
    }
)

export const flowTerminado_renovacion = addKeyword(EVENTS.ACTION).addAnswer('💬 Gracias por tu respuesta\n Con Ferreyros y CVA, siempre tendrás un aliado para que tu operación siga fuerte, segura y sin parar 🙊🚜')