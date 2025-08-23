import { MiniMap, useReactFlow } from 'reactflow'

export default function NodeMiniMap() {
  useReactFlow() // Agora está seguro, pois esse componente SÓ é chamado dentro do <ReactFlow>

  return (
    <MiniMap
      nodeColor={(n) => {
        const t = n.data?.tipo
        if (t === 'texto') return '#fde68a'
        if (t === 'imagem') return '#bae6fd'
        if (t === 'link') return '#bbf7d0'
        if (t === 'pdf') return '#fecaca'
        if (t === 'video') return '#ddd6fe'
        return '#f3f4f6'
      }}
      nodeStrokeColor={() => 'rgba(255,255,255,0.3)'}
      nodeBorderRadius={8}
      maskColor="transparent"
      position="bottom-right"
      style={{
        backdropFilter: 'blur(10px)',
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 4,
        width: 200,
        height: 100,
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      }}
    />
  )
}
