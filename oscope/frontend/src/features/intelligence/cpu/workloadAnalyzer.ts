export function analyzeWorkload(workload: any) {
  return {
    processCount: workload.length,
    averageBurstTime: 0,
    burstVariance: 0,
    burstStandardDeviation: 0,
    classification: ['SHORT_BURST']
  };
}
