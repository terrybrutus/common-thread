import { fromEnv } "mo:caffeineai-inference-client/Config";
import ChatApi "mo:caffeineai-inference-client/Apis/ChatApi";
import ChatCompletionRequest "mo:caffeineai-inference-client/Models/ChatCompletionRequest";
import ChatCompletionRequestMessageOneOf2 "mo:caffeineai-inference-client/Models/ChatCompletionRequestMessageOneOf2";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";

module {
  public func generate<system>(prompt : Text) : async* Text {
    let config = fromEnv<system>();
    let userMessage = ChatCompletionRequestMessageOneOf2.JSON.init({ content = #string(prompt); role = #user });
    let baseRequest = ChatCompletionRequest.JSON.init({ messages = [#user(userMessage)]; model = "router" });
    let response = await* ChatApi.createChatCompletion(config, { baseRequest with max_completion_tokens = ?2400 });
    if (response.choices.size() == 0) { Runtime.trap("AI returned no puzzle. Please try again.") };
    let content = response.choices[0].message.content ?? Runtime.trap("AI returned no puzzle text. Please try again.");
    if (content.size() == 0 or content.size() > 16000) { Runtime.trap("AI returned an incomplete or oversized puzzle. Please try again.") };
    content;
  };
};
