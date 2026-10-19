import Error "mo:core/Error";
import Time "mo:core/Time";
import Inference "../lib/inference";
import Prompt "../lib/puzzle-prompt";
import Types "../types";

mixin () {
  // A small shared capacity limit for this anonymous creator prototype.
  // Transient: no new persistent schema or migration is introduced.
  transient var nextGenerationAt : Int = 0;

  public shared func generatePersonalPuzzle(brief : Types.GenerationBrief) : async Text {
    let prompt = Prompt.build(brief);
    let now = Time.now();
    if (now < nextGenerationAt) { throw Error.reject("The puzzle maker is taking a breath. Please retry in about 20 seconds.") };
    nextGenerationAt := now + 20_000_000_000;
    await* Inference.generate<system>(prompt);
  };
};
