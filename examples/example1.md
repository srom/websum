```
URL: https://docs.pytorch.org/docs/stable/distributions.html
context: "pytorch lognormal distribution"
```
URL content summarized by AI model 'gpt-oss-20b':
We need excerpts about pytorch lognormal distribution. Find class LogNormal. Provide relevant excerpts: class definition, parameters, base_dist, entropy, expand, has_rsample, loc, mean, mode, scale, support, variance. Also maybe example. Provide verbatim.*class* torch.distributions.log_normal.LogNormal(*loc*, *scale*, *validate_args* = None*)[\[source\]](https://github.com/pytorch/pytorch/blob/v2.9.1/torch/distributions/log_normal.py#L14)[#](#torch.distributions.log_normal.LogNormal "Permalink to this definition")

Bases: [`TransformedDistribution`](#torch.distributions.transformed_distribution.TransformedDistribution "torch.distributions.transformed_distribution.TransformedDistribution")

Creates a log-normal distribution parameterized by [`loc`](#torch.distributions.log_normal.LogNormal.loc "torch.distributions.log_normal.LogNormal.loc") and [`scale`](#torch.distributions.log_normal.LogNormal.scale "torch.distributions.log_normal.LogNormal.scale") where:

X ~ Normal(loc, scale)
Y = exp(X) ~ LogNormal(loc, scale)

Example:

\>>> m = LogNormal(torch.tensor([0.0]), torch.tensor([1.0]))
\>>> m.sample()  # log-normal distributed with mean=0 and stddev=1
tensor([ 0.1046])

Parameters

-   **loc** ([*float*](https://docs.python.org/3/library/functions.html#float "(in Python v3.14)") *or* [*Tensor*](tensors.html#torch.Tensor "torch.Tensor")) – mean of log of distribution
    
-   **scale** ([*float*](https://docs.python.org/3/library/functions.html#float "(in Python v3.14)") *or* [*Tensor*](tensors.html#torch.Tensor "torch.Tensor")) – standard deviation of log of the distribution
    

arg\_constraints*: [dict](https://docs.python.org/3/library/stdtypes.html#dict "(in Python v3.14)")\[[str](https://docs.python.org/3/library/stdtypes.html#str "(in Python v3.14)"), [torch.distributions.constraints.Constraint](#torch.distributions.constraints.Constraint "torch.distributions.constraints.Constraint")\]* *= {'loc': Real(), 'scale': GreaterThan(lower_bound=0.0)}*[#](#torch.distributions.log_normal.LogNormal.arg_constraints "Permalink to this definition")

base\_dist*: [Normal](#torch.distributions.normal.Normal "torch.distributions.normal.Normal")*[#](#torch.distributions.log_normal.LogNormal.base_dist "Permalink to this definition")

entropy()[\[source\]](https://github.com/pytorch/pytorch/blob/v2.9.1/torch/distributions/log_normal.py#L73)[#](#torch.distributions.log_normal.LogNormal.entropy "Permalink to this definition")

expand(*batch_shape*, *\_instance* = None)[\[source\]](https://github.com/pytorch/pytorch/blob/v2.9.1/torch/distributions/log_normal.py#L48)[#](#torch.distributions.log_normal.LogNormal.expand "Permalink to this definition")

has\_rsample *= True*[#](#torch.distributions.log_normal.LogNormal.has_rsample "Permalink to this definition")

*property* loc*: [Tensor](tensors.html#torch.Tensor "torch.Tensor")*[#](#torch.distributions.log_normal.LogNormal.loc "Permalink to this definition")

*property* mean*: [Tensor](tensors.html#torch.Tensor "torch.Tensor")*[#](#torch.distributions.log_normal.LogNormal.mean "Permalink to this definition")

*property* mode*: [Tensor](tensors.html#torch.Tensor "torch.Tensor")*[#](#torch.distributions.log_normal.LogNormal.mode "Permalink to this definition")

*property* scale*: [Tensor](tensors.html#torch.Tensor "torch.Tensor")*[#](#torch.distributions.log_normal.LogNormal.scale "Permalink to this definition")

support *= GreaterThan(lower_bound=0.0)*[#](#torch.distributions.log_normal.LogNormal.support "Permalink to this definition")

*property* variance*: [Tensor](tensors.html#torch.Tensor "torch.Tensor")*[#](#torch.distributions.log_normal.LogNormal.variance "Permalink to this definition")