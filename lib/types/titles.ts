export enum TitlesResponseState {
  REQUESTED = "requested",
  RUNNING = "running",
  FAILED = "failed",
  PROCESSED = "processed",
}

type MediaProperties = {
  aspect_ratio: string;
  width: number;
  height: number;
};

type InferenceOutput = {
  images: string[];
  media_properties: MediaProperties;
  publish_url: string;
};

export type TitlesResponse = {
  state: TitlesResponseState;
  inference_id: string;
  model_id: string;
  inference_output: InferenceOutput;
};
