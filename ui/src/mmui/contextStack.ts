type TContext = {
  uiaId: unknown
  ctxtId: unknown
  seqNo: unknown
}

let contextSeq = 1000
const contextStack: TContext[] = []

export const pushCtx = (uiaId: string, ctxtId: string, params?: unknown) => {
  contextStack.push({
    uiaId: framework.getCurrentApp(),
    ctxtId: framework.getCurrCtxtId(),
    seqNo: framework.getCurrCtxtSeqNo(),
  })

  contextSeq++

  framework.routeMmuiMsg({ msgType: 'transition', enabled: true })

  framework.routeMmuiMsg({
    msgType: 'ctxtChg',
    ctxtId: ctxtId,
    uiaId: uiaId,
    params: params,
    contextSeq: contextSeq,
  })

  framework.routeMmuiMsg({
    msgType: 'focusStack',
    appIdList: framework._focusStack,
  })

  framework.routeMmuiMsg({ msgType: 'transition', enabled: false })
}

export const replaceCtx = (uiaId: string, ctxtId: string, params?: unknown) => {
  pushCtx(uiaId, ctxtId, params)
  contextStack.pop()
}

export const popCtx = () => {
  const prevContext = contextStack.pop()

  if (!prevContext) {
    return
  }

  framework.routeMmuiMsg({ msgType: 'transition', enabled: true })

  framework.routeMmuiMsg({
    msgType: 'ctxtChg',
    ctxtId: prevContext.ctxtId,
    uiaId: prevContext.uiaId,
    params: {},
    contextSeq: prevContext.seqNo,
  })

  framework.routeMmuiMsg({
    msgType: 'focusStack',
    appIdList: framework._focusStack,
  })

  framework.routeMmuiMsg({ msgType: 'transition', enabled: false })
}
