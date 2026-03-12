const InfrastructureMetrics = ({ airports }) => {

  return (
    <div className="border-b border-white/5 py-6 text-center text-sm text-zinc-400">

      Active Nodes: {airports?.length || 0}

    </div>
  );
};

export default InfrastructureMetrics;